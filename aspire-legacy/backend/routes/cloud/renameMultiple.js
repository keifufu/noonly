const { findFirstAvailable } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/rename/multiple',
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

			/* Dont allow moving inside trash */
			if(arg.location === 'trash') return res.send({ res: false, payload: 'Cannot move this Item' })
			verified.push({ path, newPath, location: arg.location, newLocation: arg.newLocation, exists, append: arg.append })
		})
		if(verified.length !== args.length) return

		const moved = []
		verified.forEach(e => {
			try {
				const parsed = nodePath.parse(e.newPath)
				if(e.path === parsed.dir) return res.send({ res: false, payload: 'Invalid Operation' })
				e.exists && e.append ?
				fs.renameSync(e.path, `${parsed.dir}/${findFirstAvailable(e.newPath)}`) :
				fs.renameSync(e.path, e.newPath)
				moved.push(e)
				if(e.newLocation !== 'trash') return
				con.query(`INSERT INTO restore (account_username, path, originalPath) VALUES ('${userRow.username}', '${e.exists && e.append ? `${parsed.dir}/${findFirstAvailable(e.newPath).split('\\').join('/')}` : e.newPath.split('\\').join('/')}', '${e.path.split('\\').join('/')}')`)
			} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
		})
		let destination = nodePath.basename(nodePath.parse(moved[0].newPath).dir)
		if([userRow.username, 'shared'].includes(destination)) destination = moved[0].newLocation === 'user' ? 'Cloud' : moved[0].newLocation === 'shared' ? 'Shared' : 'Trash'
		if(destination.length > 24) destination = `${destination.slice(0, 24)}...`
		if(moved.length === verified.length) return res.send({ res: true, payload: `Moved ${moved.length} Item${moved.length > 1 ? 's' : ''} to '${destination}'` })
	}
}