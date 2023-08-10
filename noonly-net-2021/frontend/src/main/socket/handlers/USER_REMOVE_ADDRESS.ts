import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('USER_REMOVE_ADDRESS', (data: Noonly.API.Response.UserRemoveAddressData) => {
	store.dispatch.user._removeAddress(data.deleted)
})