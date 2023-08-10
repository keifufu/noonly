import getSocket from '@main/socket'
import userService from '@main/database/services/User.service'

export default {
	event: 'USER_SET_STATUS',
	exec: (data, socket) => {
		userService.editStatus(socket.user.id, data.status)

		getSocket()?.getSockets(socket.user).forEach((socket) => {
			socket.emit('USER_SET_STATUS', { updated: { status: data.status } })
		})
	}
} as Noonly.Socket.SocketHandler