import Joi from 'joi'
import MailDeleter from '@library/common/MailDeleter'
import getSocket from '@main/socket'
import mailService from '@main/database/services/Mail.service'

export default {
	path: '/mail/clearTrash',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		addressId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.MailClearTrash } = req

		const mailToDelete = await mailService.findTrash(req.user.id, body.addressId)
		const ids = mailToDelete.map((mail) => mail.id)

		const mailDeleter = new MailDeleter(req.user)
		const deleted: string[] = await mailDeleter.deleteMultiple(ids)

		res.json({
			message: 'Cleared Trash',
			data: {
				deleted: {
					ids: deleted
				}
			}
		} as Noonly.API.Response.MailClearTrash)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('MAIL_DELETE', {
				deleted: {
					ids: deleted
				}
			} as Noonly.API.Response.MailClearTrashData)
		})
	}
} as Noonly.Express.RouteModule