import store from 'main/store'

export default function SCREENSHOT_UPLOAD(payload) {
	const state = store.getState()
	if (!state.initialLoad.screenshots) return
	store.dispatch.screenshots.add(payload)
}