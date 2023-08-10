import { InitialLoadTypes } from '@types'
import { Socket } from 'socket.io-client'
import store from 'main/store'

interface ScreenshotsLoadedData {
	screenshots: Noonly.State.Screenshots
}

export default (socket: Socket): Socket => socket.on('SCREENSHOTS_LOADED', (data: ScreenshotsLoadedData) => {
	store.dispatch.initialLoad.set({ type: InitialLoadTypes.SCREENSHOTS, value: true })
	store.dispatch.screenshots.set(data.screenshots)
})