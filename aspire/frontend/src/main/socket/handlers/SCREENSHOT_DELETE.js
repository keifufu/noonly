import store from 'main/store'

export default function SCREENSHOT_DELETE(payload) {
	const state = store.getState()
	if (!state.initialLoad.screenshots) return
	store.dispatch.screenshots.remove(payload)
}