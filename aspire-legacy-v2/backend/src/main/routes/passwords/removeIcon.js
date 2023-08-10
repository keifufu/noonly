import nodePath from 'path'
import fs from 'fs'

export default {
	route: '/passwords/removeIcon',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { id } = req.body

		if (typeof id !== 'string') return res.reject('Invalid Request')

		const [password] = await store.database.passwords.get(id, user.id)
		if (!password) return res.reject()

		const path = nodePath.normalize(`${process.env.WWW_DIR}/ss/${user.username}/icons/${password.icon}`)
		if (fs.existsSync(path)) fs.unlinkSync(path)

		await store.database.passwords.setIcon(id, user.id, null)

		res.sendRes({
			message: 'Reset Icon',
			payload: { id, icon: null }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('ACCOUNT_ICON_UPDATE', { id, icon: null })
			})
		}
	}
}