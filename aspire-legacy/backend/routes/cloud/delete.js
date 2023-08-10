const { rimraf } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/delete',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		let path = `${process.env.NODE_DIR}/data/cloud/${req.body.location}`
		if(req.body.location !== 'shared') path += `/${userRow.username}`
		path += `/${req.body.path}`
		path = nodePath.normalize(path)
		if(!fs.existsSync(path)) return res.send({ res: false, payload: 'File doesn\'t exist' })

		try {
			if(fs.statSync(path).isDirectory()) rimraf(path)
			else fs.unlinkSync(path)
			if(req.body.location === 'trash') {
				con.query(`DELETE FROM restore WHERE path = '${path.split('\\').join('/')}'`)
			}
			let itemname = nodePath.basename(path)
			if(itemname.length > 24) itemname = `${nodePath.slice(0, 24)}...`
			res.send({ res: true, payload: `Deleted '${itemname}'` })
		} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
	}
}