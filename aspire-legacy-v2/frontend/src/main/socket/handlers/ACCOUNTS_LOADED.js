import store from 'main/store'

export default function ACCOUNTS_LOADED(data) {
	store.dispatch.initialLoad.set({
		name: 'accounts',
		value: true
	})
	/* First set initialLoad to true, then set data */
	store.dispatch.accounts.set(data)
}