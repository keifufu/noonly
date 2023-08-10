import Joi from 'joi'
import accountService from '@main/database/services/Account.service'
import getSocket from '@main/socket'

export default {
	path: '/accounts/delete',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.AccountDelete } = req
		const deletedAccount = await accountService.delete(req.user.id, body.id)

		if (!deletedAccount)
			return res.status(400).json({ error: 'Something went wrong' })

		res.json({
			message: 'Deleted Account',
			data: {
				deleted: { id: deletedAccount.id }
			}
		} as Noonly.API.Response.AccountDelete)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('ACCOUNT_DELETE', {
				deleted: { id: deletedAccount.id }
			} as Noonly.API.Response.AccountDeleteData)
		})
	}
} as Noonly.Express.RouteModule