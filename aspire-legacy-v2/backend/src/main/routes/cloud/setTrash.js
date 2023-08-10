export default {
	route: '/cloud/setTrash',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { ids, trash } = req.body

		if (!Array.isArray(ids) || ids.length === 0) return res.reject('Invalid Request')
		if (typeof trash !== 'boolean') return res.reject('Invalid Request')

		let filetype = 'file'
		const allTypes = []
		const getFiles = (ids) => {
			if (ids.length === 0) return []
			return new Promise((resolve) => {
				const files = []
				ids.forEach(async (id, index) => {
					const [file] = await store.database.cloud.get(id, user.id)
					if (!file) return res.reject('Invalid Request')

					files.push(file)

					if (index === 0)
						filetype = file.type
					allTypes.push(file.type)
					if (index === ids.length - 1) resolve(files)
				})
			})
		}

		const setTrash = (files) => {
			files.forEach(async (file) => {
				if (file.user_id !== user.id) return

				if (file.type === 'folder') {
					const files = await store.database.cloud.getByParentId(file.id, user.id)
					setTrash(files)
				}

				store.database.cloud.setTrash(file.id, user.id, trash)
			})
		}

		const files = await getFiles(ids)
		setTrash(files)

		const filteredTypes = allTypes.filter((v, i, a) => a.findIndex((t) => (t === v)) === i)
		res.sendRes({
			message: ids.length === 1
				? trash === true
					? `Moved ${filetype === 'file' ? 'File' : 'Folder'} to Trash`
					: `Restored ${filetype === 'file' ? 'File' : 'Folder'}`
				: trash === true
					? `Moved ${ids.length} ${filteredTypes.length === 1 ? filteredTypes[0] === 'file' ? 'Files' : 'Folders' : 'Items'} to Trash`
					: `Restored ${ids.length} ${filteredTypes.length === 1 ? filteredTypes[0] === 'file' ? 'Files' : 'Folders' : 'Items'}`,
			payload: { ids, trash }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('CLOUD_TRASH_UPDATE', { ids, trash })
			})
		}
	}
}