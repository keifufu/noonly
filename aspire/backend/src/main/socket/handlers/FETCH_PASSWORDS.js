export default {
	event: 'FETCH_PASSWORDS',
	execute: async (payload, store, socket, user_id) => {
		const passwords = {}
		const passwordRows = await store.database.passwords.getAll(user_id)
		passwordRows.forEach((row) => {
			passwords[row.id] = row
		})

		socket.emit('PASSWORDS_FETCHED', passwords)
	}
}