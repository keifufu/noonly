import { Socket } from 'socket.io-client'
import store from 'main/store'

interface MailRefreshedData {
	mail: Noonly.State.Mail
}

export default (socket: Socket): Socket => socket.on('MAIL_REFRESHED', (data: MailRefreshedData) => {
	const state = store.getState()
	if (!state.initialLoad.mail) return

	const { mail } = data
	if (Object.keys(mail).length === 0) return
	store.dispatch.mail.add(mail)

	const unread: { [addressId: string]: number } = {}
	Object.values(mail).forEach((mail: Noonly.API.Data.Mail) => {
		if (!mail.read) {
			unread[mail.sentToAddressId]
				? unread[mail.sentToAddressId] += 1
				: unread[mail.sentToAddressId] = 1
		}
	})
	store.dispatch.user.setUnread(unread)

	const { user } = store.getState()
	user.addresses?.forEach(({ id }) => {
		store.dispatch.user.setIncoming({ address: id, incoming: false })
	})
})