export default {
	route: '/mail/setFavorite',
	middleware: false,
	type: 'post',
	user: true,
	execute: (req, res, store, user) => {
		const { ids, favorite } = req.body

		if (!Array.isArray(ids) || ids.length === 0) return res.reject('Invalid Request')
		if (typeof favorite !== 'boolean') return res.reject('Invalid Request')

		ids.forEach((id) => {
			store.database.mail.setFavorite(id, user.id, favorite)
		})

		res.sendRes({
			message: ids.length > 1
				? favorite
					? `Added ${ids.length} items to Favorites`
					: `Removed ${ids.length} items from Favorites`
				: favorite
					? 'Added Mail to Favorites'
					: 'Removed Mail from Favorites',
			payload: { ids, favorite }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('MAIL_FAVORITE_UPDATE', { ids, favorite })
			})
		}
	}
}