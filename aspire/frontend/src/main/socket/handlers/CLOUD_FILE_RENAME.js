import store from 'main/store'

export default function CLOUD_FILE_RENAME(payload) {
	const state = store.getState()
	if (!state.initialLoad.cloud) return
	store.dispatch.cloud.rename(payload)
}