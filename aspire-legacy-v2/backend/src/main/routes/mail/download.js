import nodePath from 'path'
import fs from 'fs'

export default {
	route: '/mail/download',
	middleware: false,
	type: 'get',
	user: true,
	execute: async (req, res, store, user) => {
		const { id } = req.query

		if (typeof id !== 'string') return res.reject('Invalid Request')

		const [mail] = await store.database.mail.get(id, user.id)
		if (!mail) return res.reject()

		const path = nodePath.normalize(`${process.env.DATA_DIR}/mail/eml/${mail.id}.eml`)
		if (!fs.existsSync(path)) return res.reject('Invalid Request')
		res.download(path)
	}
}