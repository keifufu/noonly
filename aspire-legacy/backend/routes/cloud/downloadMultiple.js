const { generateToken, copyFolderRecursiveSync } = require('../../Utilities')
const archiver = require('archiver')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/download/multiple',
	middleware: false,
	type: 'get',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE headers.token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		const args = JSON.parse(req.query.items)
		if(!args || !Array.isArray(args)) return res.send({ res: false, payload: 'Something went wrong' })
		const verified = []
		args.forEach(arg => {
			let path = `${process.env.NODE_DIR}/data/cloud/${arg.location}`
			if(arg.location !== 'shared') path += `/${userRow.username}`
			path += `/${arg.path}`
			path = nodePath.normalize(path)
			if(!fs.existsSync(path)) return res.send({ res: false, payload: 'Something went wrong'  })
			verified.push({ path })
		})
		if(verified.length !== args.length) return

		const token = generateToken(24)
		const path = nodePath.normalize(`${process.env.NODE_DIR}/data/temp/userdl/${token}`)
		fs.mkdirSync(path)
		verified.forEach(item => {
			if(fs.lstatSync(item.path).isDirectory()) {
				copyFolderRecursiveSync(item.path, `${path}/${nodePath.basename(item.path)}`)
			} else fs.copyFileSync(item.path, `${path}/${nodePath.basename(item.path)}`)
		})
		const key = generateToken(24)
		const zipPath = nodePath.normalize(`${process.env.NODE_DIR}/data/temp/userdl/${key}.zip`)
		res.contentType(zipPath)
		zipDirectory(path, zipPath).then(() => {
			res.download(zipPath, `${nodePath.basename(path)}.zip`)
		}).catch(() => res.send({ res: false, payload: 'Something went wrong' }))
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