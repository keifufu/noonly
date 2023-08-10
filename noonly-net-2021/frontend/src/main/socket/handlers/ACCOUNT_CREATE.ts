import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('ACCOUNT_CREATE', (data: Noonly.API.Response.AccountCreateData) => {
	const state = store.getState()
	if (!state.initialLoad.accounts) return
	store.dispatch.accounts._create(data.account)
})