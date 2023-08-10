import store from 'main/store'

export default function SCREENSHOT_FAVORITE_UPDATE(payload) {
	const state = store.getState()
	if (!state.initialLoad.screenshots) return
	store.dispatch.screenshots._setFavorite(payload)
}