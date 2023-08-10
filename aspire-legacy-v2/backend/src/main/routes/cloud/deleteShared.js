export default {
	route: '/cloud/deleteShared',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { fileId } = req.body

		if (typeof fileId !== 'string') return res.reject('Invalid Request')

		const [file] = await store.database.cloud.get(fileId, user.id)
		if (!file) return res.reject('Invalid Request')

		store.database.cloud.deleteShared(fileId, user.id)

		res.sendRes({
			message: `Unshared ${file.type === 'file' ? 'File' : 'Folder'}`,
			payload: {
				fileId,
				sharedKey: null,
				sharedPassword: ''
			}
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('CLOUD_SET_SHARED', {
					fileId,
					sharedKey: null,
					sharedPassword: ''
				})
			})
		}
	}
}