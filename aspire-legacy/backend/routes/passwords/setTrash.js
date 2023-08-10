module.exports = {
	route: '/passwords/setTrash',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
		if(!['false', 'true'].includes(req.body.trash)) return res.send({ res: false, payload: 'Invalid request' })
		con.query(`UPDATE passwords SET trash = '${req.body.trash}' WHERE account_username = '${userRow.username}' AND id = '${req.body.id}'`)
		res.send({ res: true, payload: req.body.trash === 'true' ? 'Moved to Trash' : 'Restored password' })
	}
}