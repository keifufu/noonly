import store from 'main/store'
import { Socket } from 'socket.io-client'

export default (socket: Socket): Socket => socket.on('ACCOUNT_SET_MFA_SECRET', (data: Noonly.API.Response.AccountSetMfaSecretData) => {
	const state = store.getState()
	if (!state.initialLoad.accounts) return
	store.dispatch.accounts._setMfaSecret(data.updated)
})