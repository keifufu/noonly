module.exports = {
	route: '/screenshots/fetch',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [row] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!row) return res.send({ res: false, payload: 'Something went wrong' })
		const screenshotRows = await con.query(`SELECT * FROM screenshots WHERE account_username = '${row.username}'`)
		return res.send({ res: true, payload: screenshotRows })
	}
}