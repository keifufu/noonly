import store from 'main/store'

export default function SCREENSHOT_UPLOAD(data) {
	const state = store.getState()
	if (!state.initialLoad.screenshots) return
	store.dispatch.screenshots.add(data.screenshot)
}