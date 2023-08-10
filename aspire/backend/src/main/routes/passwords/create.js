import randomID from '#library/utilities/randomID'

export default {
	route: '/passwords/create',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { site, username, email, password } = req.body

		if (typeof site !== 'string') return res.reject('Invalid Request')
		if (typeof username !== 'string') return res.reject('Invalid Request')
		if (typeof email !== 'string') return res.reject('Invalid Request')
		if (typeof password !== 'string') return res.reject('Invalid Request')

		if (site.length > 128) return res.reject('Site can\'t be longer than 128')
		if (username.length > 128) return res.reject('Username can\'t be longer than 128')
		if (email.length > 128) return res.reject('Email can\'t be longer than 128')
		if (password.length > 1024) return res.reject('Password can\'t be longer than 256')

		const id = await randomID(24, 'passwords')
		await store.database.passwords.create(user.id, site, username, email, password, id)

		const [account] = await store.database.passwords.get(id, user.id)
		res.sendRes({
			message: 'Created Account',
			payload: account
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				/* ACCOUNT_UPDATE will add/overwrite passwords client side, no need for a seperate event */
				socket.emit('ACCOUNT_UPDATE', account)
			})
		}
	}
}