const { copyFolderRecursiveSync, findFirstAvailable } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/copy',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.tokenn}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

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
			if(fs.statSync(path).isDirectory()) {
				const parsed = nodePath.parse(newPath)
				if(path === parsed.dir) return res.send({ res: false, payload: 'Invalid Operation' })
				exists && req.body.append ?
				copyFolderRecursiveSync(path, `${parsed.dir}/${findFirstAvailable(newPath)}`) :
				copyFolderRecursiveSync(path, newPath)
			} else {
				const parsed = nodePath.parse(newPath)
				exists && req.body.append ?
				fs.copyFileSync(path, `${parsed.dir}/${findFirstAvailable(newPath)}`) :
				fs.copyFileSync(path, newPath)
			}
			let destination = nodePath.basename(nodePath.parse(newPath).dir)
			if([userRow.username, 'shared'].includes(destination)) destination = req.body.newLocation === 'user' ? 'Cloud' : req.body.newLocation === 'shared' ? 'Shared' : 'Trash'
			if(destination.length > 24) destination = `${destination.slice(0, 24)}...`
			let itemname = nodePath.basename(path)
			if(itemname.length > 24) itemname = `${itemname.slice(0, 24)}...`
			res.send({ res: true, payload: `Copied '${itemname}' to '${destination}'` })
		} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
	}
}