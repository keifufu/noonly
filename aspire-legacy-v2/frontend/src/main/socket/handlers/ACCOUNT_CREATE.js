import store from 'main/store'

export default function ACCOUNT_CREATE(data) {
	const state = store.getState()
	if (!state.initialLoad.accounts) return
	store.dispatch.accounts._create(data.account)
}