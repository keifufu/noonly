import Joi from 'joi'
import MailDeleter from '@library/common/MailDeleter'
import getSocket from '@main/socket'

export default {
	path: '/mail/delete',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.MailDelete } = req
		const mailDeleter = new MailDeleter(req.user)
		const deleted = await mailDeleter.deleteMultiple(body.ids)

		res.json({
			message: 'Deleted Mail',
			data: {
				deleted: {
					ids: deleted
				}
			}
		} as Noonly.API.Response.MailDelete)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('MAIL_DELETE', {
				deleted: {
					ids: deleted
				}
			} as Noonly.API.Response.MailDeleteData)
		})
	}
} as Noonly.Express.RouteModule