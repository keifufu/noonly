export default {
	route: '/sync/passwordGenerator',
	middleware: false,
	type: 'post',
	user: true,
	execute: (req, res, store, user) => {
		const { passwordGenerator } = req.body

		store.database.settings.setPasswordGenerator(user.id, JSON.stringify(passwordGenerator))

		res.sendRes({
			message: 'Synced Password Generator'
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('SYNC_PASSWORDGENERATOR', { passwordGenerator })
			})
		}
	}
}