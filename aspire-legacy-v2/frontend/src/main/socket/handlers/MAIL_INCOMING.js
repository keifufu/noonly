import store from 'main/store'

export default function MAIL_INCOMING(payload) {
	store.dispatch.mail.setIncoming(payload)
	store.dispatch.mail.addUnread(payload)
}