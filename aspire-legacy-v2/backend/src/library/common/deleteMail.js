import nodePath from 'path'
import fs from 'fs'

async function deleteMail(store, user_id, id) {
	const [mailRow] = await store.database.mail.get(id, user_id)
	if (!mailRow) return

	const path = nodePath.normalize(`${process.env.DATA_DIR}/mail/${mailRow.id}.json`)
	const emlPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/eml/${mailRow.id}.eml`)

	let mail = {}
	if (fs.existsSync(path)) {
		mail = JSON.parse(fs.readFileSync(path))
		fs.rmSync(path)
	}
	if (fs.existsSync(emlPath)) fs.rmSync(emlPath)

	if (mail.attachments) {
		mail.attachments.forEach((attachment) => {
			if (fs.existsSync(attachment.path))
				fs.rmSync(attachment.path)
		})
	}

	store.database.mail.delete(id, user_id)
	recursivelyDeleteReplies(store, user_id, mailRow.message_id)
}

async function recursivelyDeleteReplies(store, user_id, message_id) {
	const replies = await store.database.mail.getReplies(message_id)
	replies.forEach(({ id }) => {
		deleteMail(store, user_id, id)
	})
}

export default deleteMail