import store from 'main/store'

export default function ACCOUNT_DELETE(data) {
	const state = store.getState()
	if (!state.initialLoad.accounts) return
	store.dispatch.accounts._delete(data.account || data.deleted)
}