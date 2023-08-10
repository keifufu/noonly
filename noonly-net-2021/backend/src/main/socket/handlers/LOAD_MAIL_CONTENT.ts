import mailService from '@main/database/services/Mail.service'
import fs from 'fs'
import nodePath from 'path'

export default {
	event: 'LOAD_MAIL_CONTENT',
	exec: async (data, socket) => {
		const mail = await mailService.findById(socket.user.id, data.id)
		if (!mail) return

		const jsonPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/json/${mail.id}.json`)
		if (!fs.existsSync(jsonPath)) return

		const content = JSON.parse(fs.readFileSync(jsonPath).toString())

		const images: Noonly.API.Data.MailImage[] = []
		content.attachments.forEach((attachment: Noonly.API.Data.MailAttachment) => {
			if (!attachment.related) return
			const attachmentPath = nodePath.normalize(attachment.path)
			if (!fs.existsSync(attachmentPath)) return
			const base64 = fs.readFileSync(attachmentPath, { encoding: 'base64' })
			const image = `data:image/${nodePath.extname(attachmentPath).replace('.', '')};base64,${base64}`
			images.push({ cid: attachment.cid, data: image })
		})

		socket.emit('MAIL_CONTENT_LOADED', {
			mail: {
				id: mail.id,
				images,
				...content,
				// make sure html and text are at least not null / undefined
				html: content.html || '',
				text: content.text || ''
			}
		})
	}
} as Noonly.Socket.SocketHandler