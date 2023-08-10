export default {
	route: '/passwords/update',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { id, site, username, email, password } = req.body

		if (typeof id !== 'string') return res.reject('Invalid Request')
		if (typeof site !== 'string') return res.reject('Invalid Request')
		if (typeof username !== 'string') return res.reject('Invalid Request')
		if (typeof email !== 'string') return res.reject('Invalid Request')
		if (typeof password !== 'string') return res.reject('Invalid Request')

		if (site.length > 128) return res.reject('Site can\'t be longer than 128')
		if (username.length > 128) return res.reject('Username can\'t be longer than 128')
		if (email.length > 128) return res.reject('Email can\'t be longer than 128')
		if (password.length > 1024) return res.reject('Password can\'t be longer than 256')

		await store.database.passwords.update(id, user.id, site, username, email, password)
		const [account] = await store.database.passwords.get(id, user.id)

		res.sendRes({
			message: 'Updated Account',
			payload: account
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('ACCOUNT_UPDATE', account)
			})
		}
	}
}