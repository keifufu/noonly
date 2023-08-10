import getCookie from 'library/utilities/getCookie'
import storage from 'library/utilities/storage'
import socket from 'main/socket'
import store from 'main/store'

export default function INITIAL_LOAD(payload) {
	const { mail } = payload
	console.log(mail)
	/* Set the state of the store to the just received data */
	store.dispatch.mail.set(mail)

	/* Find selected email cookie and check if this email exists */
	const { user } = storage
	const selectedAddress = getCookie('selected-address')
	if (selectedAddress && mail[selectedAddress.toLowerCase()])
		store.dispatch.mail.setSelected(selectedAddress.toLowerCase())
	else
		store.dispatch.mail.setSelected(`${user?.username?.toLowerCase()}@${process.env.REACT_APP_HOSTNAME}`)

	/* Set _initialLoad to true, causing the page to stop loading */
	socket._initialLoad = true
}