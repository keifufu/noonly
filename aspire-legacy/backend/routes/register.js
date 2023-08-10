const { generateToken } = require('../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/auth/register',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		return res.send({ res: false, payload: 'Registrations are currently disabled' })
		try {
			const { username, password } = req.body
			if(username.length > 24) return res.send({ res: false, payload: 'Username too long' })
			if(password.length > 256) return res.send({ res: false, payload: 'Password too long' })
			/* Check if username already exists */
			const [row] = await con.query(`SELECT * FROM users WHERE username = '${username}'`)
			if(row || username.toLowerCase().includes('aspire')) return res.send({ res: false, payload: 'Username already exists'})
			const token = generateToken(24)
			const ss_token = generateToken(7)
			con.query(`INSERT INTO users (username, password, avatar, token, ss_token) VALUES ('${username}', '${password}', 'null', '${token}', '${ss_token}')`)
			con.query(`INSERT INTO mail_accounts (account_username, address) VALUES ('${username}', '${username}@aspire.icu')`)
			/* Create directories */
			fs.mkdirSync(nodePath.normalize(`${process.env.NODE_DIR}/data/cloud/user/${username}`))
			fs.mkdirSync(nodePath.normalize(`${process.env.NODE_DIR}/data/cloud/trash/${username}`))
			fs.mkdirSync(nodePath.normalize(`${process.env.WWW_DIR}/ss/${username}`))
			fs.mkdirSync(nodePath.normalize(`${process.env.WWW_DIR}/ss/${username}/icons`))
			/* ---------------------------- */
			const payload = {
				username: username,
				avatar: 'null',
				token: token,
				ss_token: ss_token,
				addresses: [`${username}@aspire.icu`],
				selectedAddress: `${username}@aspire.icu`
			}
			res.send({ res: true, payload: payload })
		} catch(e) { res.send({ res: false, payload: 'Something went wrong' }) }
	}
}