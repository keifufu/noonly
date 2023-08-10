import nodePath from 'path'
import fs from 'fs'

export default {
	route: '/passwords/setIcon',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { id, icon } = req.body

		if (typeof id !== 'string') return res.reject('Invalid Request')
		if (typeof icon !== 'string') return res.reject('Invalid Request')

		const [password] = await store.database.passwords.get(id, user.id)
		if (!password) return res.reject()

		if (password.icon !== null) fs.unlinkSync(`${process.env.WWW_DIR}/ss/${user.username}/icons/${password.icon}`)
		const regex = /^data:.+\/(.+);base64,(.*)$/
		const matches = icon.match(regex)
		const ext = matches[1].toLowerCase()
		if (!['jpg', 'jpeg', 'jfif', 'png', 'webm', 'webp', 'gif'].includes(ext))
			return res.reject('Invalid File Type')
		// eslint-disable-next-line prefer-destructuring
		const data = matches[2]
		const name = `${id}.${ext}`
		const path = nodePath.normalize(`${process.env.WWW_DIR}/ss/${user.username}/icons/${name}`)
		fs.writeFileSync(path, data, { encoding: 'base64' })

		await store.database.passwords.setIcon(id, user.id, name)

		res.sendRes({
			message: 'Updated Icon',
			payload: { id, icon: name }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('ACCOUNT_ICON_UPDATE', { id, icon: name })
			})
		}
	}
}