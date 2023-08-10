import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('SCREENSHOT_EDIT_TRASH', (data: Noonly.API.Response.ScreenshotEditTrashData) => {
	const state = store.getState()
	if (!state.initialLoad.screenshots) return
	store.dispatch.screenshots._editTrash(data.updated)
})