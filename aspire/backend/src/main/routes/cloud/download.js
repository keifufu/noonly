import archiver from 'archiver'
import nodePath from 'path'
import fs from 'fs'

export default {
	route: '/cloud/download',
	middleware: false,
	type: 'get',
	user: true,
	execute: async (req, res, store, user) => {
		const { ids: _ids } = req.query
		if (typeof _ids !== 'string') return res.reject('Invalid Request')
		const ids = JSON.parse(_ids)

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
						files: await mapFiles(store, user.id, file.id)
					})
					if (i === ids.length - 1) resolve(files)
				})
			})
		}

		const files = await getFiles()
		/* Zip Files if downloading more than one or if File is a Folder */
		/* Zip File if file is bigger than 32MB and is not already zipped */
		// eslint-disable-next-line max-len
		if (files.length > 1 || files[0].type === 'folder' || (fs.lstatSync(files[0].path).size / 1000000 > 32 && !['.zip', '.rar'].includes(nodePath.extname(files[0].name).toLowerCase()))) {
			res.header('Content-Type', 'application/zip')
			res.header('Content-Disposition', 'attachment; filename="cloud.zip"')
			sendZip(files, res)
		} else {
			res.download(files[0].path)
		}
	}
}

function mapFiles(store, user_id, id) {
	return new Promise(async (resolve, reject) => {
		const res = []
		const files = await store.database.cloud.getByParentId(id, user_id)
		files.forEach(async (file, i) => {
			if (file.user_id !== user_id) return resolve(res)
			const filepath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${user_id}/${file.id}`)
			res.push({
				type: file.type,
				path: filepath,
				name: file.name,
				files: await mapFiles(store, user_id, file.id)
			})
			if (files.length - 1 === i) resolve(res)
		})
		if (files.length === 0) resolve(res)
	})
}

function sendZip(files, res) {
	const archive = archiver.create('zip', {})
	archive.on('error', (err) => {
		throw err
	})

	archive.pipe(res)

	const mapFiles = (path, file) => {
		if (file.type === 'file') {
			if (path.length > 0)
				archive.file(file.path, { name: `${path}/${file.name}` })
			else
				archive.file(file.path, { name: file.name })
		} else if (file.type === 'folder') {
			if (file.files.length === 0) {
				if (path.length > 0)
					archive.append('', { name: `${path}/${file.name}/.cloud` })
				else
					archive.append('', { name: `${file.name}/.cloud` })
			}
			file.files.forEach((_file) => {
				if (path.length > 0)
					mapFiles(`${path}/${file.name}`, _file)
				else
					mapFiles(file.name, _file)
			})
		}
	}

	files.forEach((file) => {
		mapFiles('', file)
	})

	archive.finalize()
}