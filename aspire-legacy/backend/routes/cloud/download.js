const { generateToken } = require('../../Utilities')
const archiver = require('archiver')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/download',
	middleware: false,
	type: 'get',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		let path = `${process.env.NODE_DIR}/data/cloud/${req.query.location}`
		if(req.query.location !== 'shared') path += `/${userRow.username}`
		path += `/${req.query.path}`
		path = nodePath.normalize(path)
		if(!fs.existsSync(path)) return res.send({ res: false, payload: 'Something went wrong' })

		res.contentType(path)
		if(fs.lstatSync(path).isDirectory()) {
			const key = generateToken(24)
			const zipPath = nodePath.normalize(`${process.env.NODE_DIR}/data/temp/userdl/${key}.zip`)
			res.contentType(zipPath)
			zipDirectory(path, zipPath).then(() => {
				res.download(zipPath, `${nodePath.basename(path)}.zip`)
			}).catch(() => res.send({ res: false, payload: 'Something went wrong' }))
		} else if(fs.lstatSync(path).size / 1000000 > 32 && !['.zip', '.rar'].includes(nodePath.extname(path).toLowerCase())) {
			const key = generateToken(24)
			const zipPath = nodePath.normalize(`${process.env.NODE_DIR}/data/temp/userdl/${key}.zip`)
			res.contentType(zipPath)
			zipFile(path, zipPath).then(() => {
				res.download(zipPath, `${nodePath.basename(path)}.zip`)
			}).catch(() => res.send({ res: false, payload: 'Something went wrong' }))
		} else res.download(path)
	}
}

function zipDirectory(source, out) {
	const archive = archiver('zip', { zLib: { level: 9 }})
	const stream = fs.createWriteStream(out)

	return new Promise((resolve, reject) => {
		archive.directory(source, false)
		.on('error', err => reject(err))
		.pipe(stream)

		stream.on('close', () => resolve())
		archive.finalize()
	})
}

function zipFile(source, out) {
	const archive = archiver('zip', { zLib: { level: 9 }})
	const stream = fs.createWriteStream(out)

	return new Promise((resolve, reject) => {
		archive.append(fs.createReadStream(source), { name: nodePath.basename(source) })
		.on('error', err => reject(err))
		.pipe(stream)

		stream.on('close', () => resolve())
		archive.finalize()
	})
}