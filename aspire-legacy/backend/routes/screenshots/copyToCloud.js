const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/screenshots/copyToCloud',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		const screenshotPath = `${process.env.WWW_DIR}/ss/${userRow.username}/${req.body.name}`
		if(!fs.existsSync(screenshotPath)) return res.send({ res: false, payload: 'Screenshot doesn\'t exist' })

		let path = `${process.env.NODE_DIR}/data/cloud/${req.body.location}`
		if(req.body.location !== 'shared') path += `/${userRow.username}`
		path += `/${req.body.path}/${req.body.name}`
		path = nodePath.normalize(path)
		if(fs.existsSync(path)) return res.send({ res: false, payload: 'File already exists at destination' })

		try {
			fs.copyFileSync(screenshotPath, path)
			let destination = nodePath.basename(nodePath.parse(path).dir)
			if([userRow.username, 'shared'].includes(destination)) destination = req.body.location === 'user' ? 'Cloud' : req.body.location === 'shared' ? 'Shared' : 'Trash'
			res.send({ res: true, payload: `Copied Screenshot to '${destination}'` })
		} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
	}
}