export default {
	route: '/mail/setRead',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { ids, read } = req.body

		if (!Array.isArray(ids) || ids.length === 0) return res.reject('Invalid Request')
		if (typeof read !== 'boolean') return res.reject('Invalid Request')

		ids.forEach((id) => {
			store.database.mail.setRead(id, user.id, read)
		})

		const [row] = await store.database.mail.get(ids[0], user.id)
		const address = row.to_address.toLowerCase()

		res.sendRes({
			message: ids.length > 1
				? read
					? `Marked ${ids.length} items as read`
					: `Marked ${ids.length} items as unread`
				: read
					? 'Marked as read'
					: 'Marked as unread',
			payload: { ids, read, address }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('MAIL_READ_UPDATE', { ids, read, address })
			})
		}
	}
}