import store from 'main/store'

export default function CLOUD_TRASH_UPDATE(payload) {
	const state = store.getState()
	if (!state.initialLoad.cloud) return
	store.dispatch.cloud._setTrash(payload)
}