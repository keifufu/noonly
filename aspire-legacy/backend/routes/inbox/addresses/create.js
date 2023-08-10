module.exports = {
	route: '/inbox/addresses/create',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const { address } = req.body
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
		const [mailRow] = await con.query(`SELECT * FROM mail_accounts WHERE address = '${address}'`)
		if(mailRow) return res.send({ res: false, payload: 'Adress already exists' })
		
		con.query(`INSERT INTO mail_accounts (account_username, address) VALUES ('${userRow.username}', '${address}')`)
		res.send({ res: true, payload: `Created '${address}'` })
	}
}