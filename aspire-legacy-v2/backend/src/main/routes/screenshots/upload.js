import sizeOf from 'image-size'
import nodePath from 'path'
import fs from 'fs'
import mv from 'mv'

import randomID from '#library/utilities/randomID'

export default {
	route: '/screenshots/upload',
	middleware: true,
	type: 'post',
	user: false,
	execute: async (req, res, store) => {
		const [user] = await store.database.users.getBySSToken(req.headers.token)
		if (!user) return res.send(`${process.env.URL}/ss/404.png`)
		if (!req.files || !req.files.image) return res.send(`${process.env.URL}/ss/404.png`)

		try {
			const ext = req.files.image.type.split('/')[1].toLowerCase()
			if (!['jpg', 'jpeg', 'jfif', 'png', 'webm', 'webp', 'gif'].includes(ext)) return res.send(`${process.env.URL}/ss/404.png`)
			const dimensions = sizeOf(req.files.image.path)
			const userPath = `${process.env.WWW_DIR}/ss/${user.username}`
			const { size } = fs.statSync(req.files.image.path)

			const id = await randomID(7, 'screenshots')

			const name = `${id}.${ext}`
			mv(req.files.image.path, nodePath.normalize(`${userPath}/${name}`), () => null)

			await store.database.screenshots.insert(user.id, name, ext, dimensions, size, id)
			res.send(`${process.env.URL}/ss/${user.username}/${name}`)

			if (store.hasSocket(user.id)) {
				const [screenshot] = await store.database.screenshots.get(id, user.id)
				store.getSockets(user.id).forEach(({ socket }) => {
					socket.emit('SCREENSHOT_UPLOAD', screenshot)
				})
			}
		} catch (e) {
			console.log(e)
			res.send(`${process.env.URL}/ss/404.png`)
		}
	}
}