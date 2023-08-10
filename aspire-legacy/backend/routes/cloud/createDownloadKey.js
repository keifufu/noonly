const { generateToken, folderFileSize } = require('../../Utilities')
const archiver = require('archiver')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/createDownloadKey',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		let path = `${process.env.NODE_DIR}/data/cloud/${req.body.location}`
		if(req.body.location !== 'shared') path += `/${userRow.username}`
		path += `/${req.body.path}`
		path = nodePath.normalize(path)
		if(!fs.existsSync(path)) return res.send({ res: false, payload: 'Something went wrong' })

		const key = generateToken(24)
		const expires = Math.floor(new Date(Date.now() + 1000 * 60 * 60  * 12) / 1000)
		let size = Math.floor(fs.statSync(path).size)
		if(fs.statSync(path).isDirectory()) {
			size = folderFileSize(path)
			const zipPath = nodePath.normalize(`${process.env.NODE_DIR}/data/temp/${key}.zip`)
			zipDirectory(path, zipPath).then(() => {
				con.query(`INSERT INTO shared (token, expires, path, size) VALUES ('${key}', '${expires}', '${path}', '${size}')`)
				res.send({ res: true, payload: key })
			}).catch(() => res.send({ res: false, payload: 'Something went wrong' }))
		} else {
			con.query(`INSERT INTO shared (token, expires, path, size) VALUES ('${key}', '${expires}', '${path}', '${size}')`)
			res.send({ res: true, payload: key })
		}
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