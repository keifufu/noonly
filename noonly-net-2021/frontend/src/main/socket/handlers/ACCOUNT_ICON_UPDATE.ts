import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('ACCOUNT_ICON_UPDATE', (data: Noonly.API.Response.AccountEditIconData) => {
	const state = store.getState()
	if (!state.initialLoad.accounts) return
	store.dispatch.accounts._editIcon(data.updated)
})