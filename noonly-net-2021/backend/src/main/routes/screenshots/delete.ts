import Joi from 'joi'
import fs from 'fs'
import getSocket from '@main/socket'
import nodePath from 'path'
import screenshotService from '@main/database/services/Screenshot.service'

export default {
	path: '/screenshots/delete',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.ScreenshotDelete } = req

		const updateDatabase = () => new Promise((resolve) => {
			const deleted: string[] = []
			let processed = 0
			body.ids.forEach(async (id) => {
				const deletedScreenshot = await screenshotService.delete(req.user.id, id)

				processed += 1
				/* Screenshot failed to delete, dont add to "deleted" array */
				if (!deletedScreenshot) return

				const { name, type } = deletedScreenshot
				const imagePath = nodePath.normalize(`${process.env.DATA_DIR}/img/${name}.${type}`)
				const previewImagePath = nodePath.normalize(`${process.env.DATA_DIR}/img/previews/preview_${name}.webp`)

				if (fs.existsSync(imagePath))
					fs.rmSync(imagePath)
				if (fs.existsSync(previewImagePath))
					fs.rmSync(previewImagePath)

				deleted.push(id)
				if (processed === body.ids.length)
					resolve(deleted)
			})
		})

		const deleted = await updateDatabase()

		res.json({
			message: 'Deleted Screenshot',
			data: {
				deleted: {
					ids: deleted
				}
			}
		} as Noonly.API.Response.ScreenshotDelete)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('SCREENSHOT_DELETE', {
				deleted: {
					ids: deleted
				}
			} as Noonly.API.Response.ScreenshotDeleteData)
		})
	}
} as Noonly.Express.RouteModule