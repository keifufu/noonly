export default {
	route: '/passwords/fetch',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const passwords = {}
		const passwordRows = await store.database.passwords.getAll(user.id)
		passwordRows.forEach((row) => {
			passwords[row.id] = row
		})

		res.sendRes({
			message: '',
			payload: passwords
		})
	}
}