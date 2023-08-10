export default {
	event: 'FETCH_CLOUD',
	execute: async (payload, store, socket, user_id) => {
		const cloud = {}
		const cloudRows = await store.database.cloud.getAll(user_id)
		cloudRows.forEach((row) => {
			cloud[row.id] = {
				...row,
				sharedKey: null,
				sharedPassword: ''
			}
		})

		const sharedCloudRows = await store.database.cloud.getAllShared(user_id)
		sharedCloudRows.forEach((row) => {
			if (!cloud[row.file_id]) return
			cloud[row.file_id].sharedKey = row.id
			cloud[row.file_id].sharedPassword = row.password || ''
		})

		socket.emit('CLOUD_FETCHED', cloud)
	}
}