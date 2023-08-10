import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('USER_ADD_ADDRESS', (data: Noonly.API.Response.UserAddAddressData) => {
	store.dispatch.user._addAddress(data.address)
})