module.exports = {
	route: '/passwords/create',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
		const { site, username, email, password } = req.body
		if(site.length > 128) return res.send({ res: false, payload: 'Site too long' })
		if(username.length > 128) return res.send({ res: false, payload: 'Username too long' })
		if(email.length > 128) return res.send({ res: false, payload: 'Email too long' })
		if(password.length > 256) return res.send({ res: false, payload: 'Password too long' })
		con.query(`INSERT INTO passwords (account_username, site, username, email, password, trash, createdAt, modifiedAt, icon, note) VALUES ('${userRow.username}', '${site}', '${username}', '${email}', '${password}', 'false', '${Math.floor(Date.now() / 1000)}', 'null', 'null', '')`)
		return res.send({ res: true, payload: 'Created Password' })
	}
}