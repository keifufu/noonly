const { findFirstAvailable } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/rename',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		/* Dont allow moving inside trash */
		if(req.body.location === 'trash') return res.send({ res: false, payload: 'Cannot move this Item' })

		let path = `${process.env.NODE_DIR}/data/cloud/${req.body.location}`
		if(req.body.location !== 'shared') path += `/${userRow.username}`
		path += `/${req.body.path}`
		path = nodePath.normalize(path)
		if(!fs.existsSync(path)) return res.send({ res: false, payload: 'Something went wrong' })

		let newPath = `${process.env.NODE_DIR}/data/cloud/${req.body.newLocation}`
		if(req.body.newLocation !== 'shared') newPath += `/${userRow.username}`
		newPath += `/${req.body.newPath}`
		newPath = nodePath.normalize(newPath)
		let exists = false
		if(fs.existsSync(newPath)) {
			if(!req.body.overwrite && !req.body.append) return res.send({ res: false, payload: 'EEXIST' })
			exists = true
		}

		try {
			const parsed = nodePath.parse(newPath)
			if(path === parsed.dir) return res.send({ res: false, payload: 'Invalid Operation' })
			exists && req.body.append ?
			fs.renameSync(path, `${parsed.dir}/${findFirstAvailable(newPath)}`) :
			fs.renameSync(path, newPath)
			const type = nodePath.parse(path).dir === nodePath.parse(newPath).dir ? 'Renamed' : 'Moved'
			if(req.body.newLocation === 'trash') {
				con.query(`INSERT INTO restore (account_username, path, originalPath) VALUES ('${userRow.username}', '${exists && req.body.append ? `${parsed.dir}/${findFirstAvailable(newPath).split('\\').join('/')}` : newPath.split('\\').join('/')}', '${path.split('\\').join('/')}')`)
			}
			let destination = type === 'Renamed' ? nodePath.basename(newPath) : nodePath.basename(nodePath.parse(newPath).dir)
			if([userRow.username, 'shared'].includes(destination)) destination = req.body.newLocation === 'user' ? 'Cloud' : req.body.newLocation === 'shared' ? 'Shared' : 'Trash'
			if(destination.length > 24) destination = `${destination.slice(0, 24)}...`
			let itemname = nodePath.basename(path)
			if(itemname.length > 24) itemname = `${itemname.slice(0, 24)}...`
			res.send({ res: true, payload: `${type} '${itemname}' to '${destination}'` })
		} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
	}
}