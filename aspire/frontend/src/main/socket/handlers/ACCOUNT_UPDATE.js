import store from 'main/store'

export default function ACCOUNT_UPDATE(payload) {
	const state = store.getState()
	if (!state.initialLoad.passwords) return
	store.dispatch.passwords.add(payload)
}