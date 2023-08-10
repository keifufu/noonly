import store from 'main/store'

export default function CLOUD_DELETE_FILE(payload) {
	const state = store.getState()
	if (!state.initialLoad.cloud) return
	store.dispatch.cloud._delete(payload)
}