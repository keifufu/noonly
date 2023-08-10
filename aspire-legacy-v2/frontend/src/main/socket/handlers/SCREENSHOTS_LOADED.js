import store from 'main/store'

export default function SCREENSHOTS_LOADED(data) {
	store.dispatch.initialLoad.set({
		name: 'screenshots',
		value: true
	})
	/* First set initialLoad to true, then set data */
	store.dispatch.screenshots.set(data)
}