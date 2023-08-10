export default {
	route: '/screenshots/setTrash',
	middleware: false,
	type: 'post',
	user: true,
	execute: (req, res, store, user) => {
		const { ids, trash } = req.body

		if (!Array.isArray(ids) || ids.length === 0) return res.reject('Invalid Request')
		if (typeof trash !== 'boolean') return res.reject('Invalid Request')

		ids.forEach((id) => {
			store.database.screenshots.setTrash(id, user.id, trash)
		})

		res.sendRes({
			message: ids.length > 1
				? trash
					? `Moved ${ids.length} Screenshots to Trash`
					: `Restored ${ids.length} Screenshots`
				: trash
					? 'Moved to Trash'
					: 'Restored Screenshot',
			payload: { ids, trash }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('SCREENSHOT_TRASH_UPDATE', { ids, trash })
			})
		}
	}
}