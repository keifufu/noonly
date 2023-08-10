import randomID from '#library/utilities/randomID'

export default {
	route: '/cloud/setShared',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { fileId, password } = req.body

		if (typeof fileId !== 'string') return res.reject('Invalid Request')
		if (typeof password !== 'string' && password !== null) return res.reject('Invalid Request')

		const [file] = await store.database.cloud.get(fileId, user.id)
		if (!file) return res.reject('Invalid Request')

		const [shared] = await store.database.cloud.getSharedByFileId(fileId, user.id)
		const key = await randomID(24, 'cloud_shared')

		if (shared)
			store.database.cloud.updateShared(fileId, password)
		else
			store.database.cloud.insertShared(user.id, fileId, key, password)

		res.sendRes({
			payload: {
				fileId,
				sharedKey: shared?.id || key,
				sharedPassword: password || ''
			}
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('CLOUD_SET_SHARED', {
					fileId,
					sharedKey: shared?.id || key,
					sharedPassword: password || ''
				})
			})
		}
	}
}