/* eslint-disable new-cap */
export default {
	event: 'FETCH_DATA',
	execute: async (payload, store, socket, user_id, localRequest) => {
		/* This should not be getting emitted from the client so we'll make sure only local requests are allowed */
		if (!localRequest) return
		const { location } = payload

		/**
		 * From now on, this will only fetch important data,
		 * for example data needed to display badges in the sidebar.
		 * All other data will be fetched client-side when needed
		 */


		/* Unread mail */
		const mailAccounts = await store.database.users.getMailAccountsById(user_id)
		const mailRows = await store.database.mail.getAll()
		const mail = { unread: {}, order: {}, visible: {}, origName: {} }
		mailAccounts.forEach((row) => {
			let unread = 0
			mailRows.filter((e) => e.to_address.toLowerCase() === row.address.toLowerCase())
				.forEach((row) => {
					if (!row.isread && !row.trash)
						unread += 1
				})
			mail[row.address.toLowerCase()] = []
			mail.unread[row.address.toLowerCase()] = unread
			mail.order[row.address.toLowerCase()] = row.order_index
			mail.visible[row.address.toLowerCase()] = row.visible
			mail.origName[row.address.toLowerCase()] = row.address
		})

		const data = {
			mail
		}
		socket.emit('INITIAL_LOAD', data)

		const [settings] = await store.database.settings.getSettingsById(user_id)
		const themes = settings.themes ? JSON.parse(settings.themes) : null
		const passwordGenerator = settings.passwordGenerator ? JSON.parse(settings.passwordGenerator) : null

		if (themes) socket.emit('SYNC_THEME', { themes })
		if (passwordGenerator) socket.emit('SYNC_PASSWORDGENERATOR', { passwordGenerator })

		switch (location) {
		case 'inbox':
			socket.handlers.FETCH_MAIL({}, store, socket, user_id)
			break
		case 'screenshots':
			socket.handlers.FETCH_SCREENSHOTS({}, store, socket, user_id)
			break
		case 'passwords':
			socket.handlers.FETCH_PASSWORDS({}, store, socket, user_id)
			break
		case 'cloud':
			socket.handlers.FETCH_CLOUD({}, store, socket, user_id)
			break
		case 'chat':
			socket.handlers.FETCH_CHAT({}, store, socket, user_id)
			break
		default: break
		}
	}
}