import store from 'main/store'

export default function MAIL_TRASH_UPDATE(payload) {
	const state = store.getState()

	if (state.initialLoad.mail)
		store.dispatch.mail._setTrash(payload)

	let unread = 0
	payload.ids.forEach((id) => {
		if (Boolean(state.mail[payload.address][id]?.isread) === false)
			unread += 1
	})

	payload.trash
		? store.dispatch.mail.removeUnread({ address: payload.address, unread })
		: store.dispatch.mail.addUnread({ address: payload.address, unread })
}