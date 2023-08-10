import nodePath from 'path'
import fs from 'fs'

export default {
	route: '/screenshots/delete',
	middleware: false,
	type: 'post',
	user: true,
	execute: (req, res, store, user) => {
		const { ids } = req.body

		if (!Array.isArray(ids) || ids.length === 0) return res.reject('Invalid Request')

		ids.forEach(async (id) => {
			const [screenshot] = await store.database.screenshots.get(id, user.id)
			if (!screenshot) return
			const path = nodePath.normalize(`${process.env.WWW_DIR}/ss/${user.username}/${screenshot.name}`)
			if (fs.existsSync(path))
				fs.unlinkSync(path)
			store.database.screenshots.delete(id, user.id)
		})

		res.sendRes({
			message: ids.length > 1
				? `Deleted ${ids.length} Screenshots`
				: 'Deleted Screenshot',
			payload: { ids }
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('SCREENSHOT_DELETE', { ids })
			})
		}
	}
}