export default {
	event: 'FETCH_SCREENSHOTS',
	execute: async (payload, store, socket, user_id) => {
		const screenshots = {}
		const screenshotRows = await store.database.screenshots.getAll(user_id)
		screenshotRows.forEach((row) => {
			screenshots[row.id] = row
		})

		socket.emit('SCREENSHOTS_FETCHED', screenshots)
	}
}