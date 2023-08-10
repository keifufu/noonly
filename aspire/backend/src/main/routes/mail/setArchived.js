export default {
	route: '/mail/setArchived',
	middleware: false,
	type: 'post',
	user: true,
	execute: (req, res, store, user) => {
		const { ids, archived } = req.body

		if (!Array.isArray(ids) || ids.length === 0) return res.reject('Invalid Request')
		if (typeof archived !== 'boolean') return res.reject('Invalid Request')

		ids.forEach((id) => {
			store.database.mail.setArchived(id, user.id, archived)
		})

		res.sendRes({
			message: ids.length > 1
				? archived
					? `Archived ${ids.length} items`
					: `Unarchived ${ids.length} items`
				: archived
					? 'Archived item'
					: 'Unarchived item',
			payload: { ids, archived }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('MAIL_ARCHIVED_UPDATE', { ids, archived })
			})
		}
	}
}