import Joi from 'joi'
import getSocket from '@main/socket'
import screenshotService from '@main/database/services/Screenshot.service'

export default {
	path: '/screenshots/editFavorite',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		favorite: Joi.boolean().required(),
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.ScreenshotEditFavorite } = req

		const updateDatabase = () => new Promise((resolve) => {
			const updated: string[] = []
			let processed = 0
			body.ids.forEach(async (id) => {
				const updatedScreenshot = await screenshotService.editFavorite(req.user.id, id, body.favorite)

				processed += 1
				/* Screenshot failed to update, dont add to "updated" array */
				if (!updatedScreenshot) return

				updated.push(id)
				if (processed === body.ids.length)
					resolve(updated)
			})
		})

		const updated = await updateDatabase()

		res.json({
			message: [true, 'true'].includes(body.favorite)
				? 'Added Screenshots to Favorite'
				: 'Removed Screenshots from Favorite',
			data: {
				updated: {
					ids: updated,
					favorite: body.favorite
				}
			}
		} as Noonly.API.Response.ScreenshotEditFavorite)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('SCREENSHOT_EDIT_FAVORITE', {
				updated: {
					ids: updated,
					favorite: body.favorite
				}
			} as Noonly.API.Response.ScreenshotEditFavoriteData)
		})
	}
} as Noonly.Express.RouteModule