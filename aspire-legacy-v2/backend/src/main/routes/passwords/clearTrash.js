export default {
	route: '/passwords/clearTrash',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const trash = await store.database.passwords.getTrash(user.id)

		trash.forEach((account) => {
			store.database.passwords.delete(account.id, user.id)
		})

		res.sendRes({
			message: `Deleted ${trash.length} Passwords`,
			payload: { ids: trash.map((e) => e.id) }
		})
	}
}