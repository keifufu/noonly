import store from 'main/store'

export default function ACCOUNT_ICON_UPDATE(payload) {
	const state = store.getState()
	if (!state.initialLoad.passwords) return
	store.dispatch.passwords._setIcon(payload)
}