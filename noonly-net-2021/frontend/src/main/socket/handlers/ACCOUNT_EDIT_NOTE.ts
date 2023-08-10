import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('ACCOUNT_EDIT_NOTE', (data: Noonly.API.Response.AccountEditNoteData) => {
	const state = store.getState()
	if (!state.initialLoad.accounts) return
	store.dispatch.accounts._editNote(data.updated)
})