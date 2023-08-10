module.exports = {
	route: '/passwords/fetch',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
		const passwordRows = await con.query(`SELECT * FROM passwords WHERE account_username = '${userRow.username}'`)
		res.send({ res: true, payload: passwordRows })
	}
}