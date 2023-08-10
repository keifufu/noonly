import store from 'main/store'

export default function CLOUD_CREATE_FILE(payload) {
	const state = store.getState()
	if (!state.initialLoad.cloud) return
	store.dispatch.cloud.add(payload.file)
}