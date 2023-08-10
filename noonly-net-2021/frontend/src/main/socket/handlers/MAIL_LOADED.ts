import { InitialLoadTypes } from '@types'
import { Socket } from 'socket.io-client'
import store from 'main/store'

interface MailLoadedData {
	mail: Noonly.State.Mail
}

export default (socket: Socket): Socket => socket.on('MAIL_LOADED', (data: MailLoadedData) => {
	store.dispatch.initialLoad.set({ type: InitialLoadTypes.MAIL, value: true })
	store.dispatch.mail.set(data.mail)

	const state = store.getState()
	state.user.addresses?.forEach((address) => {
		store.dispatch.user.setIncoming({ address: address.id, incoming: false })
	})
})