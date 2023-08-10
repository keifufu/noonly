import screenshotService from '@main/database/services/Screenshot.service'

const allowAfter = 'Mon Oct 25 2021 17:11:27 GMT+0200 (Central European Summer Time)'

export default {
	event: 'LOAD_SCREENSHOTS',
	exec: async (data, socket) => {
		const _screenshots = await screenshotService.findByOwnerId(socket.user.id)
		const screenshots = _screenshots.map((screenshot) => screenshotService.toClient(screenshot))

		socket.emit('SCREENSHOTS_LOADED', { screenshots })
	}
} as Noonly.Socket.SocketHandler