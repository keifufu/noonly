import userService from '@main/database/services/User.service'

export default {
	event: 'LOAD_DATA',
	exec: async (data, socket, localRequest) => {
		/* This event should only be emitted locally, and thus i can pass a fourth parameter */
		if (!localRequest) return

		/* User */
		const fullUser = await userService.fetchFullUserById(socket.user.id)

		socket.emit('INITIAL_LOAD', {
			user: fullUser
		})
	}
} as Noonly.Socket.SocketHandler