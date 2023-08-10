const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/getImageData',
	middleware: true,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		let path = `${process.env.NODE_DIR}/data/cloud/${req.body.location}`
		if(req.body.location !== 'shared') path += `/${userRow.username}`
		path += `/${req.body.path}`
		path = nodePath.normalize(path)
		if(!fs.existsSync(path)) return res.send({ res: false, payload: 'Something went wrong' })

		try {
			const base64 = fs.readFileSync(path, { encoding: 'base64' })
			const result = `data:image/${nodePath.extname(path).replace('.', '')};base64,${base64}`
			res.send({ res: true, payload: result })
		} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
	}
}