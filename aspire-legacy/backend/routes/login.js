module.exports = {
	route: '/auth/login',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE username = '${req.body.username}'`)
		if(!userRow || userRow.password !== req.body.password) return res.send({ res: false, payload: 'Invalid credentials' })
		const mailRows = await con.query(`SELECT * FROM mail_accounts WHERE account_username = '${userRow.username}'`)
		userRow.addresses = mailRows.map(e => e.address)
		/* Make selected address be username@aspire.icu */
		userRow.selectedAddress = userRow.addresses[0]
		res.send({ res: true, payload: userRow })
	}
}