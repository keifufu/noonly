import Joi from 'joi'
import getSocket from '@main/socket'
import mailService from '@main/database/services/Mail.service'

export default {
	path: '/mail/editRead',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		read: Joi.boolean().required(),
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.MailEditRead } = req

		const updateDatabase = () => new Promise((resolve) => {
			const updated: string[] = []
			let processed = 0
			body.ids.forEach(async (id) => {
				const updatedMail = await mailService.editRead(req.user.id, id, body.read)

				processed += 1
				/* Mail failed to update, dont add to "updated" array */
				if (!updatedMail) return

				updated.push(id)
				if (processed === body.ids.length)
					resolve(updated)
			})
		})

		const updated = await updateDatabase()

		res.json({
			message: [true, 'true'].includes(body.read)
				? 'Marked Mail as read'
				: 'Marked Mail as unread',
			data: {
				updated: {
					ids: updated,
					read: body.read
				}
			}
		} as Noonly.API.Response.MailEditRead)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('MAIL_EDIT_READ', {
				updated: {
					ids: updated,
					read: body.read
				}
			} as Noonly.API.Response.MailEditReadData)
		})
	}
} as Noonly.Express.RouteModule