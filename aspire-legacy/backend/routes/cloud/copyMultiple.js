const { copyFolderRecursiveSync, findFirstAvailable } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/copy/multiple',
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
			if(!fs.existsSync(path)) return res.send({ res: false, payload: 'Something went wrong' })

			let newPath = `${process.env.NODE_DIR}/data/cloud/${arg.newLocation}`
			if(arg.newLocation !== 'shared') newPath += `/${userRow.username}`
			newPath += `/${arg.newPath}`
			newPath = nodePath.normalize(newPath)
			let exists = false
			if(fs.existsSync(newPath)) {
				if(!arg.overwrite && !arg.append) return res.send({ res: false, payload: 'EEXIST' })
				exists = true
			}
			verified.push({ path, newPath, newLocation: arg.newLocation, exists, append: arg.append})
		})
		if(verified.length !== args.length) return

		const copied = []
		verified.forEach(e => {
			try {
				if(fs.statSync(e.path).isDirectory()) {
					const parsed = nodePath.parse(e.newPath)
					if(e.path === parsed.dir) return res.send({ res: false, payload: 'Invalid Operation' })
					e.exists && e.append ?
					copyFolderRecursiveSync(e.path, `${parsed.dir}/${findFirstAvailable(e.newPath)}`) :
					copyFolderRecursiveSync(e.path, e.newPath)
				} else {
					const parsed = nodePath.parse(e.newPath)
					e.exists && e.append ?
					fs.copyFileSync(e.path, `${parsed.dir}/${findFirstAvailable(e.newPath)}`) :
					fs.copyFileSync(e.path, e.newPath)
				}
				copied.push(e)
			} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
		})
		let destination = nodePath.basename(nodePath.parse(copied[0].newPath).dir)
		if([userRow.username, 'shared'].includes(destination)) destination = copied[0].newLocation === 'user' ? 'Cloud' : copied[0].newLocation === 'shared' ? 'Shared' : 'Trash'
		if(destination.length > 24) destination = `${destination.slice(0, 24)}...`
		if(copied.length === verified.length) return res.send({ res: true, payload: `Copied ${copied.length} Items to '${nodePath.basename(nodePath.parse(copied[0].newPath).dir)}'` })
	}
}