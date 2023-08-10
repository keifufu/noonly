/* eslint-disable no-unreachable */
import nodePath from 'path'
import fs from 'fs'

import randomID from '#library/utilities/randomID'

export default {
	route: '/auth/register',
	middleware: false,
	type: 'post',
	user: false,
	execute: async (req, res, store) => {
		return res.reject('Registrations are currently disabled')

		const blacklistedUsernames = ['aspire']
		try {
			const { username, password } = req.body

			if (typeof username !== 'string') return res.reject('Invalid Request')
			if (typeof password !== 'string') return res.reject('Invalid Request')

			if (username.length > 24) return res.reject('Username too long')
			if (password.length > 256) return res.reject('Password too long')

			const regexCopiedFromDaInternet = /^[A-Za-z0-9 ]+$/
			const isValid = regexCopiedFromDaInternet.test(username)
			if (!isValid) return res.reject('Invalid Username')

			/* Check if username already exists */
			const [row] = await store.database.users.getByUsername(username)
			if (row || blacklistedUsernames.includes(username.toLowerCase()))
				return res.reject('Username already exists')

			const token = await randomID(24, 'users', 'token')
			const ssToken = await randomID(7, 'users', 'ss_token')
			const cloudToken = await randomID(7, 'users', 'cloud_token')

			await store.database.users.insert(username, password, token, ssToken, cloudToken)
			const [user] = await store.database.users.getByUsername(username)
			store.database.mail.createAccount(user.id, `${user.username}@aspire.icu`)

			store.database.settings.createUser(user.id)

			/* Create directories */
			fs.mkdirSync(nodePath.normalize(`${process.env.DATA_DIR}/cloud/${user.id}`))
			fs.mkdirSync(nodePath.normalize(`${process.env.WWW_DIR}/ss/${username}`))
			fs.mkdirSync(nodePath.normalize(`${process.env.WWW_DIR}/ss/${username}/icons`))
			/* ---------------------------- */

			const mailAccounts = await store.database.users.getMailAccountsById(user.id)
			user.addresses = mailAccounts.map((e) => e.address)
			user.selectedAddress = `${user.username}@aspire.icu`

			res.sendRes({
				message: 'Created Account',
				payload: user
			})
		} catch (e) {
			res.reject()
		}
	}
}