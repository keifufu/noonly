import { Socket } from 'socket.io-client'
import store from 'main/store'

interface MailIncomingData {
	address: string
}

export default (socket: Socket): Socket => socket.on('MAIL_INCOMING', (data: MailIncomingData) => {
	store.dispatch.user.setIncoming({ address: data.address, incoming: true })
})