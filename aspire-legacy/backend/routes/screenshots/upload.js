const { generateToken } = require('../../Utilities')
const sizeOf = require('image-size')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/screenshots/upload',
	middleware: true,
	type: 'post',
	execute: async (req, res, con) => {
		const [row] = await con.query(`SELECT * FROM users WHERE ss_token = '${req.body.token}'`)
		if(!row || !req.files || !req.files.file) return res.send(`${process.env.URL}/ss/404.png`)
		try {
			const ext = req.files.file.type.split('/')[1].toLowerCase()
			if(!['jpg', 'jpeg', 'jfif', 'png', 'webm', 'gif'].includes(ext)) return res.send(`${process.env.URL}/ss/404.png`)
			const dimensions = sizeOf(req.files.file.path)
			const userPath = `${process.env.WWW_DIR}/ss/${row.username}`
			const size = fs.statSync(req.files.file.path).size
			const name = `${generateToken(7)}.${ext}`
			fs.renameSync(req.files.file.path, nodePath.normalize(`${userPath}/${name}`))
			con.query(`INSERT INTO screenshots (account_username, name, type, width, height, size, created, favorite, trash) VALUES ('${row.username}', '${name}', '${ext}', '${dimensions.width}', '${dimensions.height}', '${size}', '${Math.floor(Date.now() / 1000)}', 'false', 'false')`)
			res.send(`${process.env.URL}/ss/${row.username}/${name}`)
		} catch(e) { res.send(`${process.env.URL}/ss/404.png`) }
	}
}