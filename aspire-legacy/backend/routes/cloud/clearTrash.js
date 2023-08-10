const { rimraf } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/clearTrash',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		const path = nodePath.normalize(`${process.env.NODE_DIR}/data/cloud/trash/${userRow.username}`)
		if(!fs.existsSync(path)) return res.send({ res: false, payload: 'Something went wrong' })

		try {
			const files = fs.readdirSync(path)
			files.forEach(file => {
				if(fs.statSync(`${path}/${file}`).isDirectory()) rimraf(`${path}/${file}`)
				else fs.unlinkSync(`${path}/${file}`)
			})
			con.query(`DELETE FROM restore WHERE account_username = '${userRow.username}'`)
			res.send({ res: true, payload: `Removed ${files.length} Items from Trash` })
		} catch(e) { console.log(e); res.send({ res: false, payload: 'Something went wrong' }) }
	}
}