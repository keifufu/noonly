import nodePath from 'path'
import fs from 'fs'

export default {
	route: '/cloud/getDownloadInformation',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { ids } = req.body

		if (!Array.isArray(ids) || ids.length === 0) return res.reject('Invalid Request')

		const getFiles = () => {
			const files = []
			// eslint-disable-next-line no-undef
			return new Promise((resolve) => {
				ids.forEach(async (id, i) => {
					const [file] = await store.database.cloud.get(id, user.id)
					if (!file) return res.reject('Invalid Request')

					const filepath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${user.id}/${id}`)
					files.push({
						type: file.type,
						path: filepath,
						name: file.name,
						size: file.type === 'file'
							? fs.statSync(filepath).size
							: await getFolderSize(store, user, file.id)
					})
					if (i === ids.length - 1) resolve(files)
				})
			})
		}

		const files = await getFiles()

		const payload = {
			zip: false,
			name: 'unknown',
			size: 0
		}

		if (files.length > 1 || files[0].type === 'folder'
			|| (fs.statSync(files[0].path).size / 1000000 > 32 && !['.zip', '.rar'].includes(nodePath.extname(files[0].name).toLowerCase()))) {
			payload.zip = true
			payload.name = 'cloud.zip'
			payload.size = files.reduce((a, b) => (a.size + b.size))
		} else {
			payload.zip = false
			payload.name = files[0].name
			payload.size = files[0].size
		}


		res.sendRes({
			payload: payload
		})
	}
}

function getFolderSize(store, user, id) {
	return new Promise(async (resolve) => {
		let size = 0
		const files = await store.database.cloud.getByParentId(id, user.id)
		files.forEach(async (file, i) => {
			if (file.user_id !== user.id) return
			if (file.type === 'file') {
				const filepath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${user.id}/${file.id}`)
				size += fs.statSync(filepath).size
			} else if (file.type === 'folder') {
				const folderSize = await getFolderSize(store, user, file.id)
				size += folderSize
			}
			if (files.length - 1 === i) resolve(size)
		})
		if (files.length === 0) resolve(size)
	})
}