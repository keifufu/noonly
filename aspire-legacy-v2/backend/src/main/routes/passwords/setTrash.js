export default {
	route: '/passwords/setTrash',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { id, trash } = req.body

		if (typeof id !== 'string') return res.reject('Invalid Request')
		if (typeof trash !== 'boolean') return res.reject('Invalid Request')

		await store.database.passwords.setTrash(id, user.id, trash)

		res.sendRes({
			message: trash
				? 'Moved to Trash'
				: 'Restored Account',
			payload: { id, trash }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('ACCOUNT_TRASH_UPDATE', { id, trash })
			})
		}
	}
}