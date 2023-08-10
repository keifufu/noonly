const { findFirstAvailable } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/upload',
	middleware: true,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
		if(!req.files || !req.files.file) return

		let path = `${process.env.NODE_DIR}/data/cloud/${req.body.location}`
		if(req.body.location !== 'shared') path += `/${userRow.username}`
		path += `/${req.body.path}`
		path = nodePath.normalize(path)

		try {
			const exists = fs.existsSync(path)
			const parsed = nodePath.parse(path)
			exists && req.body.type === 'append' ?
			fs.renameSync(req.files.file.path, `${parsed.dir}/${findFirstAvailable(path)}`) :
			fs.renameSync(req.files.file.path, path)
			res.send({ res: true, payload: 'Success' })
		} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
	}
}