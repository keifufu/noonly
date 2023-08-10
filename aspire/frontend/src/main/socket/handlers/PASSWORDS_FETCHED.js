import store from 'main/store'

export default function PASSWORDS_FETCHED(payload) {
	store.dispatch.passwords.set(payload)
	store.dispatch.initialLoad.set({
		name: 'passwords',
		value: true
	})
}