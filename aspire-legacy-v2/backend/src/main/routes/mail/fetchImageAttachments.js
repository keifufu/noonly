import nodePath from 'path'
import fs from 'fs'

export default {
	route: '/mail/fetchImageAttachments',
	middleware: false,
	type: 'post',
	user: true,
	execute: (req, res, store, user) => {
		const { id } = req.body

		if (typeof id !== 'string') return res.reject('Invalid Request')

		const images = []
		const path = nodePath.normalize(`${process.env.DATA_DIR}/mail/${id}.json`)
		if (!fs.existsSync(path)) return

		const mail = JSON.parse(fs.readFileSync(path))
		if (!mail.attachments) return res.sendRes({ payload: [] })

		mail.attachments.forEach((e) => {
			const attachmentPath = nodePath.normalize(e.path)
			const ext = nodePath.extname(attachmentPath)
			if (!['.jpg', '.jpeg', '.jfif', '.png', '.webm', 'webp', '.gif'].includes(ext)) return
			if (!fs.existsSync(path)) return
			const base64 = fs.readFileSync(attachmentPath, { encoding: 'base64' })
			const image = `data:image/${nodePath.extname(attachmentPath).replace('.', '')};base64,${base64}`
			images.push({ cid: e.cid, data: image })
		})

		res.sendRes({
			message: '',
			payload: images
		})
	}
}