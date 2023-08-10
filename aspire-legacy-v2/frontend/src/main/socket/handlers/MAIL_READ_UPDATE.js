import store from 'main/store'

export default function MAIL_READ_UPDATE(payload) {
	const state = store.getState()

	if (state.initialLoad.mail)
		store.dispatch.mail._setRead(payload)

	payload.read
		? store.dispatch.mail.removeUnread({ address: payload.address, unread: payload.ids.length })
		: store.dispatch.mail.addUnread({ address: payload.address, unread: payload.ids.length })
}