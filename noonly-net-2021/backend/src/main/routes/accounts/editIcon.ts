import Joi from 'joi'
import accountService from '@main/database/services/Account.service'
import getSocket from '@main/socket'
import userService from '@main/database/services/User.service'

export default {
	path: '/accounts/editIcon',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		icon: Joi.string().allow(null).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.AccountEditIcon } = req

		if (body.icon !== null) {
			const user = await userService.findById(req.user.id)
			if (!user?.icons.includes(body.icon))
				return res.status(400).json({ error: 'Invalid icon name provided' })
		}

		const updatedAccount = await accountService.editIcon(req.user.id, body.id, body.icon)

		if (!updatedAccount)
			return res.status(400).json({ error: 'Something went wrong' })

		res.json({
			message: body.icon === null
				? 'Removed Account Icon'
				: 'Updated Account Icon',
			data: {
				updated: {
					id: updatedAccount.id,
					icon: updatedAccount.icon
				}
			}
		} as Noonly.API.Response.AccountEditIcon)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('ACCOUNT_ICON_UPDATE', {
				updated: {
					id: updatedAccount.id,
					icon: updatedAccount.icon
				}
			} as Noonly.API.Response.AccountEditIconData)
		})
	}
} as Noonly.Express.RouteModule