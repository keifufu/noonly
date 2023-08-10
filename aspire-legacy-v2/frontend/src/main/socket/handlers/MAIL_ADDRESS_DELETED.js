import store from 'main/store'

export default function MAIL_ADDRESS_DELETED(payload) {
	store.dispatch.mail._removeAddress(payload.address)
}