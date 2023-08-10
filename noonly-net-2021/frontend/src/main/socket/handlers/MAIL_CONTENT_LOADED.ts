import { Socket } from 'socket.io-client'
import store from 'main/store'

interface MailContentLoadedData {
	mail: Noonly.Action.MailFetchContent
}

export default (socket: Socket): Socket => socket.on('MAIL_CONTENT_LOADED', (data: MailContentLoadedData) => {
	const state = store.getState()
	if (!state.initialLoad.mail) return
	store.dispatch.mail._fetchContent(data.mail)
})