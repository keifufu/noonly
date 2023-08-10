import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('USER_ICON_UPLOAD', (data: Noonly.API.Response.UserUploadIconData) => {
	store.dispatch.user._uploadIcon(data.updated)
})