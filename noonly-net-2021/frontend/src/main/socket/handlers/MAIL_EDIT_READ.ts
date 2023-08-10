import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('MAIL_EDIT_READ', (data: Noonly.API.Response.MailEditReadData) => {
	const state = store.getState()
	if (!state.initialLoad.mail) return

	store.dispatch.mail._editRead(data.updated)
	const { ids } = data.updated
	const addressId = state.mail.find((mail) => mail.id === ids[0])?.sentToAddressId
	if (addressId)
		store.dispatch.user.editUnread({ address: addressId, ids, read: data.updated.read, rootState: state })
})