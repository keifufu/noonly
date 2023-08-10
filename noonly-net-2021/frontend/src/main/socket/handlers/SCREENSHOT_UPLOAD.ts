import { Socket } from 'socket.io-client'
import store from 'main/store'

interface ScreenshotUploadData {
	screenshot: Noonly.API.Data.Screenshot
}

export default (socket: Socket): Socket => socket.on('SCREENSHOT_UPLOAD', (data: ScreenshotUploadData) => {
	const state = store.getState()
	if (!state.initialLoad.screenshots) return
	store.dispatch.screenshots.add(data.screenshot)
})