import nodePath from 'path'
import fs from 'fs'

export default {
	event: 'FETCH_MAIL_CONTENT',
	execute: async (payload, store, socket, user_id) => {
		const id = payload
		const [mail] = await store.database.mail.get(id, user_id)
		if (!mail) return
		const path = nodePath.normalize(`${process.env.DATA_DIR}/mail/${mail.id}.json`)
		if (!fs.existsSync(path)) return
		const mailJson = JSON.parse(fs.readFileSync(path))

		/* Only emit this to the socket that requested mail content, not all open sockets by user */
		socket.emit('MAIL_CONTENT_FETCHED', {
			id: mail.id,
			text: mailJson.text || '',
			html: mailJson.html,
			attachments: mailJson.attachments
		})
	}
}