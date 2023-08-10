import store from 'main/store'

export default function SCREENSHOTS_FETCHED(payload) {
	store.dispatch.screenshots.set(payload)
	store.dispatch.initialLoad.set({
		name: 'screenshots',
		value: true
	})
}