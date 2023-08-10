export default {
	route: '/mail/setTrash',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { ids, trash } = req.body

		if (!Array.isArray(ids) || ids.length === 0) return res.reject('Invalid Request')
		if (typeof trash !== 'boolean') return res.reject('Invalid Request')

		ids.forEach((id) => {
			store.database.mail.setTrash(id, user.id, trash)
		})

		const [row] = await store.database.mail.get(ids[0], user.id)
		const address = row.to_address.toLowerCase()

		res.sendRes({
			message: ids.length > 1
				? trash
					? `Moved ${ids.length} items to Trash`
					: `Restored ${ids.length} items`
				: trash
					? 'Moved to Trash'
					: 'Restored Mail',
			payload: { ids, trash, address }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('MAIL_TRASH_UPDATE', { ids, trash, address })
			})
		}
	}
}