import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('SCREENSHOT_EDIT_FAVORITE', (data: Noonly.API.Response.ScreenshotEditFavoriteData) => {
	const state = store.getState()
	if (!state.initialLoad.screenshots) return
	store.dispatch.screenshots._editFavorite(data.updated)
})