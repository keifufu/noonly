module.exports = {
	route: '/passwords/update',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const { id, site, username, email, password } = req.body
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
		if(site.length > 128) return res.send({ res: false, payload: 'Site too long' })
		if(username.length > 128) return res.send({ res: false, payload: 'Username too long' })
		if(email.length > 128) return res.send({ res: false, payload: 'Email too long' })
		if(password.length > 256) return res.send({ res: false, payload: 'Password too long' })
		const [passwordRow] = await con.query(`SELECT * FROM passwords WHERE account_username = '${userRow.username}' AND id = '${id}'`)
		if(!passwordRow) return res.send({ res: false, payload: 'Something went wrong' })
		con.query(`UPDATE passwords SET site = '${site}', username = '${username}', email = '${email}', password = '${password}', modifiedAt = '${Math.floor(Date.now() / 1000)}' WHERE account_username = '${userRow.username}' AND id = '${id}'`)
		res.send({ res: true, payload: 'Updated Password' })
	}
}