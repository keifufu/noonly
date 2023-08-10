import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('MAIL_EDIT_TRASH', (data: Noonly.API.Response.MailEditTrashData) => {
	const state = store.getState()
	if (!state.initialLoad.mail) return
	store.dispatch.mail._editTrash(data.updated)

	const { ids } = data.updated
	const unreadMail = ids.filter((id) => !state.mail.find((mail) => mail.id === id)?.read)
	const addressId = state.mail.find((mail) => mail.id === ids[0])?.sentToAddressId
	if (addressId)
		store.dispatch.user.setUnread({ [addressId]: data.updated.trash ? -unreadMail.length : unreadMail.length })
})