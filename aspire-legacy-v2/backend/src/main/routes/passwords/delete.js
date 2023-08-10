export default {
	route: '/passwords/delete',
	middleware: false,
	type: 'post',
	user: true,
	execute: (req, res, store, user) => {
		const { id } = req.body

		if (typeof id !== 'string') return res.reject('Invalid Request')

		store.database.passwords.delete(id, user.id)

		res.sendRes({
			message: 'Deleted Account',
			payload: id
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('ACCOUNT_DELETE', id)
			})
		}
	}
}