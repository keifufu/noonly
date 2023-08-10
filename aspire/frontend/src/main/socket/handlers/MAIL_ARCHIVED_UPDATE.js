import store from 'main/store'

export default function MAIL_ARCHIVED_UPDATE(payload) {
	const state = store.getState()
	if (!state.initialLoad.mail) return
	store.dispatch.mail._setArchived(payload)
}