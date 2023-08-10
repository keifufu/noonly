import Joi from 'joi'
import getSocket from '@main/socket'
import mailService from '@main/database/services/Mail.service'

export default {
	path: '/mail/editTrash',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		trash: Joi.boolean().required(),
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.MailEditTrash } = req

		const updateDatabase = () => new Promise((resolve) => {
			const updated: string[] = []
			let processed = 0
			body.ids.forEach(async (id) => {
				const updatedMail = await mailService.editTrash(req.user.id, id, body.trash)

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
			message: [true, 'true'].includes(body.trash)
				? 'Moved Mail to Trash'
				: 'Restored Mail',
			data: {
				updated: {
					ids: updated,
					trash: body.trash
				}
			}
		} as Noonly.API.Response.MailEditTrash)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('MAIL_EDIT_TRASH', {
				updated: {
					ids: updated,
					trash: body.trash
				}
			} as Noonly.API.Response.MailEditTrashData)
		})
	}
} as Noonly.Express.RouteModule