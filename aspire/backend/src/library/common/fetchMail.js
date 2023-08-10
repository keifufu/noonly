import { simpleParser } from 'mailparser'
import nodePath from 'path'
import fs from 'fs'

import randomToken from '#library/utilities/randomToken'
import randomID from '#library/utilities/randomID'
import store from '#main/store'

function fetchMail() {
	const inboxDir = nodePath.normalize(process.env.INBOX_DIR)
	readRecursive(inboxDir)
}

function readRecursive(dir) {
	if (!fs.existsSync(dir)) return
	const files = fs.readdirSync(dir)
	files.forEach((file) => {
		const path = nodePath.normalize(`${dir}/${file}`)
		const ext = nodePath.extname(file)
		if (fs.statSync(path).isDirectory()) readRecursive(path)
		else if (ext === '.eml') processEml(path)
	})
}

function processEml(path) {
	if (!fs.existsSync(path)) return
	const eml = fs.readFileSync(path, 'utf-8')
	simpleParser(eml, { skipImageLinks: true, skipTextToHtml: true }).then(async (data) => {
		try {
			let forwardedTo = null
			if (data.headers.has('x-forwarded-to'))
				forwardedTo = data.headers.get('x-forwarded-to')

			let inReplyTo = null
			if (data.headers.has('in-reply-to'))
				inReplyTo = data.headers.get('in-reply-to')

			if (forwardedTo) {
				if (!forwardedTo.includes('@aspire.icu')) return

				/* This is luckily case insensitive */
				const [addressRow] = await store.database.mail.getAddress(forwardedTo)
				if (!addressRow) return

				const filename = await randomID(24, 'mail')
				const attachments = []
				data.attachments.forEach((e) => {
					const attachmentName = randomToken(24)
					const path = nodePath.normalize(`${process.env.DATA_DIR}/mail/attachments/${attachmentName}-${e.filename}`)
					fs.writeFileSync(path, Buffer.from(e.content))
					delete e.content
					e.path = path.split('\\').join('/')
					e.id = attachmentName
					const attachment = {
						filename: e.filename,
						cid: e.cid,
						related: e.related,
						path: e.path,
						id: e.id
					}
					attachments.push(attachment)
				})
				data.attachments = attachments

				// eslint-disable-next-line max-len
				await store.database.mail.insert(addressRow.user_id, data.from.value[0].address, addressRow.address, inReplyTo, Date.parse(data.date), data.messageId, filename)

				const mailPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/${filename}.json`)
				const mailData = {
					attachments: data.attachments,
					html: data.html,
					/* Keep text for preview text */
					text: data.text,
					subject: data.subject,
					from: {
						email: data.from.value[0].address,
						name: data.from.value[0].name.length > 0
							? data.from.value[0].name
							: data.from.value[0].address.split('@')[0]
					},
					to: {
						email: data.to.value[0].address,
						name: data.to.value[0].name.length > 0
							? data.to.value[0].name
							: data.to.value[0].address.split('@')[0]
					}
				}
				fs.writeFileSync(mailPath, JSON.stringify(mailData, null, 2))

				const origMailPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/eml/${filename}.eml`)
				fs.copyFileSync(path, origMailPath)

				fs.rmSync(path)

				/* Send updates to connected user sockets */
				if (store.hasSocket(addressRow.user_id)) {
					store.getSockets(addressRow.user_id).forEach(({ socket }) => {
						socket.emit('MAIL_INCOMING', {
							address: addressRow.address.toLowerCase(),
							incoming: true,
							unread: 1
						})
					})
				}
			} else {
				if (!data.to) return
				data.to.value.forEach(async ({ address }, index) => {
					if (!address.includes('@aspire.icu')) return

					/* This is luckily case insensitive */
					const [addressRow] = await store.database.mail.getAddress(data.to.value[index].address)
					if (!addressRow) return

					const filename = await randomID(24, 'mail')
					const attachments = []
					data.attachments.forEach((e) => {
						const attachmentName = randomToken(24)
						const path = nodePath.normalize(`${process.env.DATA_DIR}/mail/attachments/${attachmentName}-${e.filename}`)
						fs.writeFileSync(path, Buffer.from(e.content))
						delete e.content
						e.path = path.split('\\').join('/')
						e.id = attachmentName
						const attachment = {
							filename: e.filename,
							cid: e.cid,
							related: e.related,
							path: e.path,
							id: e.id
						}
						attachments.push(attachment)
					})
					data.attachments = attachments

					// eslint-disable-next-line max-len
					await store.database.mail.insert(addressRow.user_id, data.from.value[0].address, addressRow.address, inReplyTo, Date.parse(data.date), data.messageId, filename)

					const mailPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/${filename}.json`)
					const mailData = {
						attachments: data.attachments,
						html: data.html,
						/* Keep text for preview text */
						text: data.text,
						subject: data.subject,
						from: {
							email: data.from.value[0].address,
							name: data.from.value[0].name.length > 0
								? data.from.value[0].name
								: data.from.value[0].address.split('@')[0]
						},
						to: {
							email: data.to.value[0].address,
							name: data.to.value[0].name.length > 0
								? data.to.value[0].name
								: data.to.value[0].address.split('@')[0]
						}
					}
					fs.writeFileSync(mailPath, JSON.stringify(mailData, null, 2))

					const origMailPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/eml/${filename}.eml`)
					fs.copyFileSync(path, origMailPath)
					if (index === data.to.value.length - 1)
						fs.rmSync(path)

					/* Send updates to connected user sockets */
					if (store.hasSocket(addressRow.user_id)) {
						store.getSockets(addressRow.user_id).forEach(({ socket }) => {
							socket.emit('MAIL_INCOMING', {
								address: addressRow.address.toLowerCase(),
								incoming: true,
								unread: 1
							})
						})
					}
				})
			}
		} catch (e) {
			console.log(e)
		}
	}).catch(console.log)
}

export default fetchMail