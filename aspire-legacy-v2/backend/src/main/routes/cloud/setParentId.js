export default {
	route: '/cloud/setParentId',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { ids, parent_id } = req.body

		if (!Array.isArray(ids) || ids.length === 0) return res.reject('Invalid Request')
		if (typeof parent_id !== 'string' && parent_id !== null) return res.reject('Invalid Request')

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

		if (parent_id !== null) {
			const [parentFile] = await store.database.cloud.get(parent_id, user.id)
			if (parentFile?.type !== 'folder') return res.reject('Invalid Request')
		}

		const files = await getFiles(ids)
		files.forEach((file) => {
			store.database.cloud.setParentId(file.id, user.id, parent_id)
		})

		const filteredTypes = allTypes.filter((v, i, a) => a.findIndex((t) => (t === v)) === i)
		res.sendRes({
			message: ids.length === 1
				? `Moved ${filetype === 'file' ? 'File' : 'Folder'}`
				: `Moved ${ids.length} ${filteredTypes.length === 1 ? filteredTypes[0] === 'file' ? 'Files' : 'Folders' : 'Items'}`,
			payload: { ids, parent_id }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('CLOUD_PARENT_UPDATE', { ids, parent_id })
			})
		}
	}
}