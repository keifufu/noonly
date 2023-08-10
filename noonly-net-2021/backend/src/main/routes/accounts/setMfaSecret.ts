import accountService from '@main/database/services/Account.service'
import getSocket from '@main/socket'
import Joi from 'joi'

export default {
	path: '/accounts/setMfaSecret',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		mfaSecret: Joi.string().min(0).max(4096).allow(null),
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.AccountSetMfaSecret } = req
		const updatedAccount = await accountService.setMfaSecret(req.user.id, body.id, body.mfaSecret)

		if (!updatedAccount)
			return res.status(400).json({ error: 'Something went wrong' })

		res.json({
			message: 'Updated MFA Secret',
			data: {
				updated: {
					id: updatedAccount.id,
					mfaSecret: updatedAccount.mfaSecret
				}
			}
		} as Noonly.API.Response.AccountSetMfaSecret)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('ACCOUNT_SET_MFA_SECRET', {
				updated: {
					id: updatedAccount.id,
					mfaSecret: updatedAccount.mfaSecret
				}
			} as Noonly.API.Response.AccountSetMfaSecretData)
		})
	}
} as Noonly.Express.RouteModule