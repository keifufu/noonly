module.exports = {
	route: '/passwords/delete',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
		const [passwordRow] = await con.query(`SELECT * FROM passwords WHERE account_username = '${userRow.username}' AND id = '${req.body.id}'`)
		if(!passwordRow) return res.send({ res: false, payload: 'Something went wrong' })
		con.query(`DELETE FROM passwords WHERE account_username = '${userRow.username}' AND id = '${req.body.id}'`)
		res.send({ res: true, payload: 'Deleted Password' })
	}
}