import Joi from 'joi'
import accountService from '@main/database/services/Account.service'
import getSocket from '@main/socket'

export default {
	path: '/accounts/edit',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		site: Joi.string().min(1).max(256).required(),
		username: Joi.string().min(0).max(256).required().allow(''),
		address: Joi.string().min(0).max(256).required().allow(''),
		password: Joi.string().min(1).max(2048).required(),
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.AccountEdit } = req
		const updatedAccount = await accountService.edit(req.user.id, body.id, body.site, body.username, body.address, body.password)

		if (!updatedAccount)
			return res.status(400).json({ error: 'Something went wrong' })

		const clientAccount = accountService.toClient(updatedAccount)

		res.json({
			message: 'Updated Account',
			data: {
				account: clientAccount
			}
		} as Noonly.API.Response.AccountEdit)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('ACCOUNT_CREATE', {
				account: clientAccount
			} as Noonly.API.Response.AccountEditData)
		})
	}
} as Noonly.Express.RouteModule