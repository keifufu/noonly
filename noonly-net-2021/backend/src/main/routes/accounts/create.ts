import Joi from 'joi'
import accountService from '@main/database/services/Account.service'
import getSocket from '@main/socket'

export default {
	path: '/accounts/create',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		site: Joi.string().min(1).max(256).required(),
		username: Joi.string().min(0).max(256).required().allow(''),
		address: Joi.string().min(0).max(256).required().allow(''),
		password: Joi.string().min(1).max(2048).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.AccountCreate } = req
		const newAccount = await accountService.createAccount(req.user.id, body.site, body.username, body.address, body.password)
		const newClientAccount = accountService.toClient(newAccount)

		res.json({
			message: 'Created Account',
			data: {
				account: newClientAccount
			}
		} as Noonly.API.Response.AccountCreate)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('ACCOUNT_CREATE', {
				account: newClientAccount
			} as Noonly.API.Response.AccountCreateData)
		})
	}
} as Noonly.Express.RouteModule