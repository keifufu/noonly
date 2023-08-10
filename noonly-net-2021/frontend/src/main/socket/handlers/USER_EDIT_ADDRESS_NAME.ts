import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('USER_EDIT_ADDRESS_NAME', (data: Noonly.API.Response.UserEditAddressNameData) => {
	store.dispatch.user._editAddressName(data.updated)
})