import { InitialLoadTypes } from '@types'
import { Socket } from 'socket.io-client'
import store from 'main/store'

interface InitialLoadData {
	user: Noonly.API.Data.User
}

export default (socket: Socket): Socket => socket.on('INITIAL_LOAD', (data: InitialLoadData) => {
	store.dispatch.user.set(data.user)
	store.dispatch.initialLoad.set({ type: InitialLoadTypes.APP, value: true })
})