module.exports = {
	route: '/passwords/setNote',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const { id, note } = req.body
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
		const [passwordRow] = await con.query(`SELECT * FROM passwords WHERE account_username = '${userRow.username}' AND id = '${id}'`)
		if(!passwordRow) return res.send({ res: false, payload: 'Something went wrong' })
		if(note.length > 512) return res.send({ res: false, payload: 'Note is too long' })
		con.query(`UPDATE passwords SET note = '${note}' WHERE account_username = '${userRow.username}' AND id = '${id}'`)
		res.send({ res: true, payload: 'Updated Note' })
	}
}