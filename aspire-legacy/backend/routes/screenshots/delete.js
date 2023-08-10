const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/screenshots/delete',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [row] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!row) return res.send({ res: false, payload: 'Something went wrong' })
		const [screenshotRow] = await con.query(`SELECT * FROM screenshots WHERE account_username = '${row.username}' AND id = '${req.body.id}'`)
		if(!screenshotRow) return res.send({ res: false, payload: 'Something went wrong' })
		const path = nodePath.normalize(`${process.env.WWW_DIR}/ss/${row.username}/${screenshotRow.name}`)
		if(!fs.existsSync(path)) return res.send({ res: false, payload: 'Something went wrong' })
		try {
			fs.unlinkSync(path)
			con.query(`DELETE FROM screenshots WHERE id = '${req.body.id}'`)
			res.send({ res: true, payload: 'Deleted Screenshot' })
		} catch (e) { res.send({ res: false, payload: 'Something went wrong' }) }
	}
}