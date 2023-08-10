import randomID from '#library/utilities/randomID'

export default {
	route: '/cloud/folder/create',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { name, parent_id } = req.body

		if (typeof name !== 'string') return res.reject('Invalid Request')
		if (typeof parent_id !== 'string' && parent_id !== null) return res.reject('Invalid Request')

		if (name.length > 256) return res.reject('Invalid Request')
		if (name.length < 1) return res.reject('Invalid Request')

		if (parent_id !== null) {
			const [parentFile] = await store.database.cloud.get(parent_id, user.id)
			if (parentFile?.type !== 'folder') return res.reject('Invalid Request')
		}

		const id = await randomID(24, 'cloud')
		await store.database.cloud.insertFolder(user.id, name, 0, parent_id, id)
		const [file] = await store.database.cloud.get(id, user.id)

		res.sendRes({
			message: 'Created Folder',
			payload: file
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('CLOUD_CREATE_FILE', { file: file })
			})
		}
	}
}