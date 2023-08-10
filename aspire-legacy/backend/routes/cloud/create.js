const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/create',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		let path = `${process.env.NODE_DIR}/data/cloud/${req.body.location}`
		if(req.body.location !== 'shared') path += `/${userRow.username}`
		path += `/${req.body.path}`
		path = nodePath.normalize(path)
		if(fs.existsSync(path)) return res.send({ res: false, payload: 'Folder already exists' })

		try {
			fs.mkdirSync(path)
			let itemname = nodePath.basename(path)
			if(itemname.length > 24) itemname = `${nodePath.slice(0, 24)}...`
			res.send({ res: true, payload: `Created '${itemname}'` })
		} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
	}
}