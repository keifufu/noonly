const { rimraf } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/delete/multiple',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		const args = JSON.parse(req.body.items)
		if(!args || !Array.isArray(args)) return res.send({ res: false, payload: 'Something went wrong' })
		const verified = []
		args.forEach(arg => {
			let path = `${process.env.NODE_DIR}/data/cloud/${arg.location}`
			if(arg.location !== 'shared') path += `/${userRow.username}`
			path += `/${arg.path}`
			path = nodePath.normalize(path)
			if(!fs.existsSync(path)) return res.send({ res: false, payload: 'File doesn\'t exist'  })
			verified.push({ path })
		})
		if(verified.length !== args.length) return

		const deleted = []
		verified.forEach(e => {
			try {
				if(fs.statSync(e.path).isDirectory()) rimraf(e.path)
				else fs.unlinkSync(e.path)
				if(req.body.location === 'trash') {
					con.query(`DELETE FROM restore WHERE path = '${e.path.split('\\').join('/')}'`)
				}
				deleted.push(e)
			} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
		})
		if(deleted.length === verified.length) return res.send({ res: true, payload: `Deleted ${deleted.length} Items` })
	}
}