const { findFirstAvailable } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/restore',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		let path = nodePath.normalize(`${process.env.NODE_DIR}/data/cloud/trash/${userRow.username}/${req.body.path}`)
		if(!fs.existsSync(path)) return res.send({ res: false, payload: 'Something went wrong' })
		path = path.split('\\').join('/')

		const [restoreRow] = await con.query(`SELECT * FROM restore WHERE path = '${path}'`)
		if(!restoreRow || !restoreRow.originalPath) return res.send({ res: false, payload: 'Something went wrong' })

		const directory = nodePath.dirname(restoreRow.originalPath)
		if(!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true })

		try {
			const parsed = nodePath.parse(restoreRow.originalPath)
			if(fs.existsSync(restoreRow.originalPath)) fs.renameSync(path, `${parsed.dir}/${findFirstAvailable(restoreRow.originalPath)}`)
			else fs.renameSync(path, restoreRow.originalPath)
			con.query(`DELETE FROM restore WHERE id = '${restoreRow.id}'`)
			let itemname = nodePath.basename(path)
			if(itemname.length > 24) itemname = `${itename.slice(0, 24)}...`
			res.send({ res: true, payload: `Restored '${itemname}'` })
		} catch(e) { console.log(e); console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
	}
}