import getSocket from '@main/socket'
import screenshotService from '@main/database/services/Screenshot.service'

export default {
	path: '/screenshots/clearTrash',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const screenshotsToDelete = await screenshotService.findTrash(req.user.id)
		const ids = screenshotsToDelete.map((screenshot) => screenshot.id)
		await screenshotService.clearTrash(req.user.id)

		res.json({
			message: 'Cleared Trash',
			data: {
				deleted: { ids }
			}
		} as Noonly.API.Response.ScreenshotClearTrash)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('SCREENSHOT_DELETE', {
				deleted: { ids }
			} as Noonly.API.Response.ScreenshotClearTrashData)
		})
	}
} as Noonly.Express.RouteModule