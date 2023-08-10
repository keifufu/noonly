import zipEncrypted from 'archiver-zip-encrypted'
import archiver from 'archiver'
import nodePath from 'path'
import fs from 'fs'

archiver.registerFormat('zip-encrypted', zipEncrypted)

export default {
	route: '/cloud/sharedDownload',
	middleware: false,
	type: 'get',
	user: false,
	execute: async (req, res, store) => {
		const { key } = req.query
		if (!key) return res.send('This File doesn\'t exist anymore')

		const [shared] = await store.database.cloud.getSharedByKey(key)
		if (!shared) return res.send('This File doesn\'t exist anymore')
		const [file] = await store.database.cloud.getUnauthorized(shared.file_id)
		if (!file) return res.send('This File doesn\'t exist anymore')

		const filepath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${file.user_id}/${file.id}`)
		const filesize = file.type === 'file' ? fs.lstatSync(filepath).size / 1000000 : 0

		const zipData = {
			type: file.type,
			path: filepath,
			name: file.name,
			files: await mapFiles(store, file.user_id, file.id)
		}

		/* Zip File if File is a Folder */
		/* Zip File if File is bigger than 32MB and is not already zipped */
		/* Zip File if a Password is set */
		if (file.type === 'folder' || (filesize > 32 && !['.zip', '.rar'].includes(nodePath.extname(file.name).toLowerCase())) || shared.password) {
			res.header('Content-Type', 'application/zip')
			res.header('Content-Disposition', `attachment; filename="${file.name}.zip"`)
			sendZip([zipData], shared.password, res)
		} else {
			res.download(filepath, file.name)
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

function sendZip(files, password, res) {
	const archive = archiver.create(password ? 'zip-encrypted' : 'zip', {
		encryptionMethod: 'aes256',
		password
	})
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