import deleteMail from '#library/common/deleteMail'

export default {
	route: '/mail/clearTrash',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const trash = await store.database.mail.getTrash(user.id)

		trash.forEach((mail) => {
			deleteMail(store, user.id, mail.id)
		})

		res.sendRes({
			message: trash.length > 1
				? `Deleted ${trash.length} Items`
				: 'Deleted Mail',
			payload: { ids: trash.map((e) => e.id) }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('MAIL_DELETE', { ids: trash.map((e) => e.id) })
			})
		}
	}
}