import nodePath from 'path'
import fs from 'fs'

export default {
	route: '/mail/downloadAttachment',
	middleware: false,
	type: 'get',
	user: true,
	execute: async (req, res, store, user) => {
		const { id, attachmentId } = req.query

		if (typeof id !== 'string') return res.reject('Invalid Request')
		if (typeof attachmentId !== 'string') return res.reject('Invalid Request')

		const [mailRow] = await store.database.mail.get(id, user.id)
		if (!mailRow) return res.reject()

		const mailPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/${mailRow.id}.json`)
		if (!fs.existsSync(mailPath)) return res.reject()

		const mail = JSON.parse(fs.readFileSync(mailPath))
		const attachment = mail.attachments.find((e) => e.id === attachmentId)
		if (!attachment) return res.reject()

		const path = nodePath.normalize(attachment.path)
		if (!fs.existsSync(path)) return res.reject('Invalid Request')
		res.download(path)
	}
}