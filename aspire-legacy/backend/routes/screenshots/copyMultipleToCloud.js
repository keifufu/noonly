const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/screenshots/copyToCloud/multiple',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		const args = JSON.parse(req.body.items)
		if(!args || !Array.isArray(args)) return res.send({ res: false, payload: 'Something went wrong' })
		const verified = []
		args.forEach(arg => {
			const screenshotPath = `${process.env.WWW_DIR}/ss/${userRow.username}/${arg.name}`
			if(!fs.existsSync(screenshotPath)) return res.send({ res: false, payload: 'Screenshot doesn\'t exist' })

			let path = `${process.env.NODE_DIR}/data/cloud/${arg.location}`
			if(arg.location !== 'shared') path += `/${userRow.username}`
			path += `/${arg.path}/${arg.name}`
			path = nodePath.normalize(path)
			if(fs.existsSync(path)) return res.send({ res: false, payload: 'File already exists at destination' })

			verified.push({ screenshotPath, location: arg.location, path })
		})

		const copied = []
		verified.forEach(item => {
			try {
				fs.copyFileSync(item.screenshotPath, item.path)
				copied.push(item)
			} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
		})
		let destination = nodePath.basename(nodePath.parse(copied[0].path).dir)
		if([userRow.username, 'shared'].includes(destination)) destination = copied[0].location === 'user' ? 'Cloud' : copied[0].location === 'shared' ? 'Shared' : 'Trash'
		res.send({ res: true, payload: `Copied ${copied.length} Screenshots to '${nodePath.basename(nodePath.parse(copied[0].path).dir)}'` })
	}
}