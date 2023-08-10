import Joi from 'joi'
import getSocket from '@main/socket'
import screenshotService from '@main/database/services/Screenshot.service'

export default {
	path: '/screenshots/editTrash',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		trash: Joi.boolean().required(),
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.ScreenshotEditTrash } = req

		const updateDatabase = () => new Promise((resolve) => {
			const updated: string[] = []
			let processed = 0
			body.ids.forEach(async (id) => {
				const updatedScreenshot = await screenshotService.editTrash(req.user.id, id, body.trash)

				processed += 1
				/* Screenshot failed to update, dont add to "updated" array */
				if (!updatedScreenshot) return

				updated.push(id)
				if (processed === body.ids.length)
					resolve(updated)
			})
		})

		try {
			const updated = await updateDatabase()

			res.json({
				message: [true, 'true'].includes(body.trash)
					? 'Moved Screenshot to Trash'
					: 'Restored Screenshot',
				data: {
					updated: {
						ids: updated,
						trash: body.trash
					}
				}
			} as Noonly.API.Response.ScreenshotEditTrash)

			getSocket()?.getSockets(req.user).forEach((socket) => {
				if (req.header('socketid') === socket.id) return
				socket.emit('SCREENSHOT_EDIT_TRASH', {
					updated: {
						ids: updated,
						trash: body.trash
					}
				} as Noonly.API.Response.ScreenshotEditTrashData)
			})
		} catch (error) {
			console.error(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}
} as Noonly.Express.RouteModule