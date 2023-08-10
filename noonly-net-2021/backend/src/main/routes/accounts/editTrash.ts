import Joi from 'joi'
import accountService from '@main/database/services/Account.service'
import getSocket from '@main/socket'

export default {
	path: '/accounts/editTrash',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		trash: Joi.boolean().required(),
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.AccountEditTrash } = req
		const updatedAccount = await accountService.editTrash(req.user.id, body.id, body.trash)

		if (!updatedAccount)
			return res.status(400).json({ error: 'Something went wrong' })

		res.json({
			message: [true, 'true'].includes(body.trash)
				? 'Moved Account to Trash'
				: 'Restored Account',
			data: {
				updated: {
					id: updatedAccount.id,
					trash: updatedAccount.trash
				}
			}
		} as Noonly.API.Response.AccountEditTrash)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('ACCOUNT_EDIT_TRASH', {
				updated: {
					id: updatedAccount.id,
					trash: updatedAccount.trash
				}
			} as Noonly.API.Response.AccountEditTrashData)
		})
	}
} as Noonly.Express.RouteModule