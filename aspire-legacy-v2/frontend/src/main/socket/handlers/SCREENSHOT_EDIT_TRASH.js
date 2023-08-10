import store from 'main/store'

export default function SCREENSHOT_EDIT_TRASH(data) {
	const state = store.getState()
	if (!state.initialLoad.screenshots) return
	store.dispatch.screenshots._editTrash(data.updated)
}