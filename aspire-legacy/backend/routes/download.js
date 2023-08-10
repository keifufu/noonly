const { folderFileSize } = require('../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/download',
	middleware: false,
	type: 'get',
	execute: async (req, res, con) => {
		const [row] = await con.query(`SELECT * FROM shared WHERE token = '${req.query.key}'`)
		if(!row) return res.send('Invalid key')

		if(Math.floor(Date.now() / 1000) > row.expires) return res.send('Invalid Key')
		if(!fs.existsSync(row.path)) return res.send('Invalid Key')

		const stats = fs.statSync(row.path)
		if(stats.isDirectory()) {
			if(folderFileSize(row.path) !== parseInt(row.size)) return res.send('The File has changed and they key is no longer valid')
			const zipPath = nodePath.normalize(`${process.env.NODE_DIR}/temp/${row.token}.zip`)
			res.download(zipPath, `${nodePath.basename(row.path)}.zip`)
		} else {
			if(Math.floor(stats.size) !== parseInt(row.size)) return res.send('The File has changed and the key is no longer valid')
			res.download(row.path)
		}
	}
}