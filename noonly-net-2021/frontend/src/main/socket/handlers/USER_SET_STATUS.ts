import { Socket } from 'socket.io-client'
import store from 'main/store'

interface UserSetStatusData {
	updated: {
		status: Noonly.API.Data.UserStatus
	}
}

export default (socket: Socket): Socket => socket.on('USER_SET_STATUS', (data: UserSetStatusData) => {
	store.dispatch.user._setStatus(data.updated)
})