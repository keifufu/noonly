import store from 'main/store'

export default function MAIL_ADDRESS_CREATED(payload) {
	store.dispatch.mail._addAddress(payload)
}