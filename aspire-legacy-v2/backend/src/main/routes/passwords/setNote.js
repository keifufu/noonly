export default {
	route: '/passwords/setNote',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { id, note } = req.body

		if (typeof id !== 'string') return res.reject('Invalid Request')
		if (typeof note !== 'string') return res.reject('Invalid Request')
		if (note.length > 512) return res.reject('Note is too long')

		await store.database.passwords.setNote(id, user.id, note)

		res.sendRes({
			message: 'Updated Note',
			payload: { id, note }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('ACCOUNT_NOTE_UPDATE', { id, note })
			})
		}
	}
}