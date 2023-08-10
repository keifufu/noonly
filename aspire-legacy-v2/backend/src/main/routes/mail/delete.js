import deleteMail from '#library/common/deleteMail'

export default {
	route: '/mail/delete',
	middleware: false,
	type: 'post',
	user: true,
	execute: (req, res, store, user) => {
		const { ids } = req.body

		if (!Array.isArray(ids) || ids.length === 0) return res.reject('Invalid Request')

		ids.forEach((id) => {
			deleteMail(store, user.id, id)
		})

		res.sendRes({
			message: ids.length > 1
				? `Deleted ${ids.length} Items`
				: 'Deleted Mail',
			payload: { ids }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('MAIL_DELETE', { ids })
			})
		}
	}
}