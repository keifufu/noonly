module.exports = {
	route: '/groups/fetch',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		const groups = con.query(`SELECT * FROM groups`)
		const userGroups = []
		groups.forEach(group => {
			if(JSON.parse(group.users).includes(userRow.id)) {
				userGroups.push(group)
			}
		})

		res.send({ res: true, payload: userGroups })
	}
}