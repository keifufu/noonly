import accountService from '@main/database/services/Account.service'
import getSocket from '@main/socket'

export default {
	path: '/accounts/clearTrash',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const accountsToDelete = await accountService.findTrash(req.user.id)
		const ids = accountsToDelete.map((account) => account.id)
		await accountService.clearTrash(req.user.id)

		res.json({
			message: 'Cleared Trash',
			data: {
				deleted: { ids }
			}
		} as Noonly.API.Response.AccountClearTrash)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('ACCOUNT_DELETE', {
				deleted: { ids }
			} as Noonly.API.Response.AccountClearTrashData)
		})
	}
} as Noonly.Express.RouteModule