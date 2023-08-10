import store from 'main/store'

export default function SCREENSHOT_DELETE(data) {
	const state = store.getState()
	if (!state.initialLoad.screenshots) return
	store.dispatch.screenshots._delete(data.deleted)
}