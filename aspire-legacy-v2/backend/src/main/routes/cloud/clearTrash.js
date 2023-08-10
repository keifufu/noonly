import nodePath from 'path'
import fs from 'fs'

export default {
	route: '/cloud/clearTrash',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const trash = await store.database.cloud.getTrash(user.id)
		const ids = trash.map((e) => e.id)

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

		const deleteFiles = (files) => {
			files.forEach(async (file) => {
				if (file.user_id !== user.id) return
				if (file.type === 'file') {
					const filepath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${user.id}/${file.id}`)
					if (fs.existsSync(filepath))
						fs.rmSync(filepath)

					store.database.cloud.delete(file.id, user.id)
					store.database.cloud.deleteShared(file.id, user.id)
				} else if (file.type === 'folder') {
					const files = await store.database.cloud.getByParentId(file.id, user.id)
					deleteFiles(files)

					store.database.cloud.delete(file.id, user.id)
					store.database.cloud.deleteShared(file.id, user.id)
				}
			})
		}

		const files = await getFiles(ids)
		deleteFiles(files)

		const filteredTypes = allTypes.filter((v, i, a) => a.findIndex((t) => (t === v)) === i)
		res.sendRes({
			message: ids.length === 1
				? `Deleted ${filetype === 'file' ? 'File' : 'Folder'}`
				: `Deleted ${ids.length} ${filteredTypes.length === 1 ? filteredTypes[0] === 'file' ? 'Files' : 'Folders' : 'Items'}`,
			payload: { ids }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('CLOUD_DELETE_FILE', { ids })
			})
		}
	}
}