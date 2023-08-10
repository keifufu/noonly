import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('MAIL_DELETE', (data: Noonly.API.Response.MailDeleteData) => {
	const state = store.getState()
	if (!state.initialLoad.mail) return
	store.dispatch.mail._delete(data.deleted)
})