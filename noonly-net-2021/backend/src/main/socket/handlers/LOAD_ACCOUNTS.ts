import accountService from '@main/database/services/Account.service'

export default {
	event: 'LOAD_ACCOUNTS',
	exec: async (data, socket) => {
		const _accounts = await accountService.findByOwnerId(socket.user.id)
		const accounts = _accounts.map((account) => accountService.toClient(account))

		socket.emit('ACCOUNTS_LOADED', { accounts })
	}
} as Noonly.Socket.SocketHandler