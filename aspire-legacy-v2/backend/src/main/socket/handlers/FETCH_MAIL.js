import nodePath from 'path'
import fs from 'fs'

export default {
	event: 'FETCH_MAIL',
	execute: async (payload, store, socket, user_id) => {
		/**
		 * This will not fetch mail content from now on,
		 * the content will be fetched when client opens the mail
		 */

		const added = []
		const findMail = (obj, mail) => {
			let found = null
			Object.values(obj).forEach((e) => {
				if (e.message_id === mail.in_reply_to) found = e
				if (e.replies) {
					const res = findMail(e.replies, mail)
					e.replies = res
				}
			})
			if (found) {
				if (!Array.isArray(found.replies)) found.replies = []
				found.replies.push(mail)
				added.push(mail)
			}
			return obj
		}

		const mail = {}
		const mailAccounts = await store.database.users.getMailAccountsById(user_id)
		const mailRows = await store.database.mail.getAll()
		mailAccounts.forEach((row) => {
			const accountMail = []
			mailRows.filter((e) => e.to_address.toLowerCase() === row.address.toLowerCase())
				.forEach((row) => {
					const path = nodePath.normalize(`${process.env.DATA_DIR}/mail/${row.id}.json`)
					if (!fs.existsSync(path)) return
					const mailJson = JSON.parse(fs.readFileSync(path))
					const mail = {
						id: row.id,
						isread: row.isread,
						trash: row.trash,
						archived: row.archived,
						subject: mailJson.subject,
						previewText: mailJson.text?.substr(0, 150) || '',
						from: mailJson.from,
						date: row.date,
						message_id: row.message_id,
						in_reply_to: row.in_reply_to
					}
					accountMail.push(mail)
				})

			let sortedMail = {}
			accountMail.forEach((mail) => {
				if (mail.in_reply_to) {
					sortedMail = findMail(sortedMail, mail)
				} else {
					sortedMail[mail.id] = mail
					added.push(mail)
				}
			})

			Object.values(sortedMail).forEach((mail) => {
				delete mail.message_id
				delete mail.in_reply_to
			})

			accountMail.forEach((mail) => {
				if (!added.find((e) => e.message_id === mail.message_id))
					sortedMail[mail.id] = mail
			})
			mail[row.address.toLowerCase()] = sortedMail
		})

		const _unread = {}
		Object.keys(mail).forEach((address) => {
			const unread = Object.values(mail[address]).filter((e) => !e.isread && !e.trash)
			_unread[address] = unread.length
		})
		mail.unread = _unread

		socket.emit('MAIL_FETCHED', mail)
	}
}