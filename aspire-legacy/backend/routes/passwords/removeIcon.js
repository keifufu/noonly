const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/passwords/removeIcon',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const { id } = req.body
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
		const [passwordRow] = await con.query(`SELECT * FROM passwords WHERE account_username = '${userRow.username}' AND id = '${id}'`)
		if(!passwordRow) return res.send({ res: false, payload: 'Something went wrong' })
		try {
			const path = nodePath.normalize(`${process.env.WWW_DIR}/ss/${userRow.username}/icons/${passwordRow.icon}`)
			fs.unlinkSync(path)
			con.query(`UPDATE passwords SET icon = 'null' WHERE account_username = '${userRow.username}' AND id = '${id}'`)
			res.send({ res: true, payload: 'Reset Icon' })
		} catch(e) { res.send({ res: false, payload: 'Something went wrong' }) }
	}
}