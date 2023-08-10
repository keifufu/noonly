import store from 'main/store'

export default function MAIL_CONTENT_FETCHED(payload) {
	store.dispatch.mail._setContent(payload)
}