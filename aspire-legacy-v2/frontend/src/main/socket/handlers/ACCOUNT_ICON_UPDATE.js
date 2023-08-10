import store from 'main/store'

export default function ACCOUNT_ICON_UPDATE(payload) {
	const state = store.getState()
	if (!state.initialLoad.accounts) return
	store.dispatch.accounts._setIcon(payload)
}