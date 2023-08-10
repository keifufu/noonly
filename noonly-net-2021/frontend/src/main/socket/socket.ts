import { InitialLoadTypes } from '@types'
import apiHost from 'library/utilities/apiHost'
import devBuild from 'library/utilities/devBuild'
import io from 'socket.io-client'
import registerHandlers from './handlers'
import storage from 'library/utilities/storage'
import store from 'main/store'
import toast from 'library/utilities/toast'

const socket = io(apiHost, {
	extraHeaders: {
		Authorization: `Bearer ${storage.jwtToken}`
	},
	path: '/socket',
	reconnection: Boolean(storage.jwtToken)
})

socket.onAny((event, ...args) => {
	if (devBuild)
		console.log('[SOCKET]', event, ...args)
})

socket.on('connect_error', (err) => {
	if (err.message === 'Unauthorized') {
		socket.disconnect()
		storage.logout()
	}
})

socket.on('connect', () => {
	store.dispatch.initialLoad.set({ type: InitialLoadTypes.ACCOUNTS, value: false })
	store.dispatch.initialLoad.set({ type: InitialLoadTypes.MAIL, value: false })
	store.dispatch.initialLoad.set({ type: InitialLoadTypes.SCREENSHOTS, value: false })
	store.dispatch.initialLoad.set({ type: InitialLoadTypes.FILES, value: false })
})

socket.on('disconnect', () => {
	if (!storage.jwtToken) return
	store.dispatch.initialLoad.set({ type: InitialLoadTypes.APP, value: 'DISCONNECTED' })
})

window.addEventListener('beforeunload', () => socket.disconnect())
registerHandlers(socket)

const Socket = {
	emit: (event: string, ...args:any[]): void => {
		if (store.getState().initialLoad.app === 'DISCONNECTED')
			return toast.showError('Not connected')
		if (devBuild)
			console.log('[EMIT]', event, ...args)
		socket.emit(event, ...args)
	},
	getId: (): string => socket.id
}

export default Socket