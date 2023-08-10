import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('ACCOUNT_DELETE', (data: Noonly.API.Response.AccountDeleteData) => {
	const state = store.getState()
	if (!state.initialLoad.accounts) return
	store.dispatch.accounts._delete(data.deleted)
})