import store from 'main/store'

export default function CLOUD_SET_SHARED(payload) {
	const state = store.getState()
	if (!state.initialLoad.cloud) return
	store.dispatch.cloud._setShared(payload)
}