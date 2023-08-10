import { Socket } from 'socket.io-client'
import store from 'main/store'

export default (socket: Socket): Socket => socket.on('USER_AVATAR_UPDATE', (data: Noonly.API.Response.UserUploadAvatarData) => {
	store.dispatch.user._uploadAvatar(data.updated)
})