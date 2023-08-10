import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('USER_ICON_DELETE', (data: Noonly.API.Response.UserDeleteIconData) => {
	store.dispatch.user._deleteIcon(data.deleted)
	const state = store.getState()
	if (!state.initialLoad.accounts) return
	store.dispatch.accounts._deleteIcon(data.deleted)
})