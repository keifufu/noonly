import nodePath from 'path'
import fs from 'fs'

import randomID from '#library/utilities/randomID'

export default {
	route: '/cloud/copyFiles',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { ids, parent_id } = req.body

		if (!Array.isArray(ids) || ids.length === 0) return res.reject('Invalid Request')
		if (typeof parent_id !== 'string' && parent_id !== null) return res.reject('Invalid Request')

		if (parent_id !== null) {
			const [parentFile] = await store.database.cloud.get(parent_id, user.id)
			if (parentFile?.type !== 'folder') return res.reject('Invalid Request')
		}

		let filetype = 'file'
		const allTypes = []
		const getCopyFiles = (ids) => {
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

		const copyFiles = (copyFiles) => {
			if (copyFiles.length === 0) return []
			return new Promise((resolve) => {
				const files = []
				copyFiles.forEach(async (copyFile, index) => {
					const id = await randomID(24, 'cloud')
					const filePath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${user.id}/${id}`)
					const copyFilePath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${user.id}/${copyFile.id}`)
					fs.copyFileSync(copyFilePath, filePath)

					await store.database.cloud.insertFile(user.id, copyFile.name, copyFile.size, parent_id, id)
					const [file] = await store.database.cloud.get(id, user.id)
					files.push(file)

					if (index === copyFiles.length - 1) resolve(files)
				})
			})
		}

		const filesToCopy = await getCopyFiles(ids)
		const files = await copyFiles(filesToCopy)

		const filteredTypes = allTypes.filter((v, i, a) => a.findIndex((t) => (t === v)) === i)
		res.sendRes({
			message: ids.length === 1
				? `Copied ${filetype === 'file' ? 'File' : 'Folder'}`
				: `Copied ${ids.length} ${filteredTypes.length === 1 ? filteredTypes[0] === 'file' ? 'Files' : 'Folders' : 'Items'}`,
			payload: { files }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				files.forEach((file) => {
					socket.emit('CLOUD_CREATE_FILE', { file })
				})
			})
		}
	}
}