import store from 'main/store'

export default function MAIL_DELETE(payload) {
	const state = store.getState()
	if (!state.initialLoad.mail) return
	store.dispatch.mail.remove(payload)
}