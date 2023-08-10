export default {
	route: '/sync/themes',
	middleware: false,
	type: 'post',
	user: true,
	execute: (req, res, store, user) => {
		const { themes } = req.body

		store.database.settings.setThemes(user.id, JSON.stringify(themes))

		res.sendRes({
			message: 'Synced Themes'
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('SYNC_THEME', { themes })
			})
		}
	}
}