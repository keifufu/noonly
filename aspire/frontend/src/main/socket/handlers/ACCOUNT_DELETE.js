import store from 'main/store'

export default function ACCOUNT_DELETE(payload) {
	const state = store.getState()
	if (!state.initialLoad.passwords) return
	store.dispatch.passwords.remove(payload)
}