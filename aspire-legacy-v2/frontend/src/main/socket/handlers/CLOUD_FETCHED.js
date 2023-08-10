import store from 'main/store'

export default function CLOUD_FETCHED(payload) {
	store.dispatch.cloud.set(payload)
	store.dispatch.initialLoad.set({
		name: 'cloud',
		value: true
	})
}