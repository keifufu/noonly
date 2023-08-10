import slice from '#library/utilities/slice'

export default {
	route: '/cloud/rename',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { id, name } = req.body

		if (typeof id !== 'string') return res.reject('Invalid Request')
		if (typeof name !== 'string') return res.reject('Invalid Request')

		const [file] = await store.database.cloud.get(id, user.id)
		if (!file) return res.reject('Invalid Request')

		await store.database.cloud.rename(id, user.id, name)

		res.sendRes({
			message: `Renamed ${file.type === 'file' ? 'File' : 'Folder'} to '${slice(name)}'`,
			payload: { id, name }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('CLOUD_FILE_RENAME', { id, name })
			})
		}
	}
}