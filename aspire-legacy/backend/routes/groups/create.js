const { generateToken } = require('../../Utilities')
module.exports = {
	route: '/groups/create',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		const channel_id = generateToken(24)
		const users = []
		req.body.users.forEach(id => {
			if(typeof id === 'number') users.push(id)
		})
		con.query(`INSERT INTO groups (channel_id, users) VALUES ('${channel_id}', '${users}')`)
	}
}