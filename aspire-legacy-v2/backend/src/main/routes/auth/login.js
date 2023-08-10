export default {
	route: '/auth/login',
	middleware: false,
	type: 'post',
	user: false,
	execute: async (req, res, store) => {
		const { username, password } = req.body

		if (typeof username !== 'string') return res.reject('Invalid Request')
		if (typeof password !== 'string') return res.reject('Invalid Request')

		const [user] = await store.database.users.getByUsername(username)
		if (!user || user.password !== password)
			return res.reject('Invalid Credentials')

		res.sendRes({
			message: 'Successfully signed in',
			payload: user
		})
	}
}