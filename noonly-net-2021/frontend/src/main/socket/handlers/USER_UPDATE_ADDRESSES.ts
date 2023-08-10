import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('USER_UPDATE_ADDRESSES', (data: Noonly.API.Response.UserUpdateAddressesData) => {
	store.dispatch.user._updateAddresses(data.updated)
})