import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('SCREENSHOT_DELETE', (data: Noonly.API.Response.ScreenshotDeleteData) => {
	const state = store.getState()
	if (!state.initialLoad.screenshots) return
	store.dispatch.screenshots._delete(data.deleted)
})