import randomToken from '@library/utilities/randomToken'
import { AddressDocument } from '@main/database/models/Address.model'
import { UserDocument } from '@main/database/models/User.model'
import addressService from '@main/database/services/Address.service'
import mailService from '@main/database/services/Mail.service'
import getSocket from '@main/socket'
import fs from 'fs'
import { simpleParser } from 'mailparser'
import nodePath from 'path'

class MailFetcher {
	interval: NodeJS.Timeout

	constructor() {
		this.interval = null
	}

	get isActive() {
		return this.interval !== null
	}

	start(ms = 5000) {
		if (this.isActive) return
		this.interval = setInterval(this.fetch.bind(this), ms)
	}

	stop() {
		clearInterval(this.interval)
		this.interval = null
	}

	fetch() {
		const inboxPath = nodePath.normalize(process.env.INBOX_DIR)
		if (!fs.existsSync(inboxPath)) return
		this.readRecursive(inboxPath)
	}

	readRecursive(_path: string) {
		const files = fs.readdirSync(_path)
		files.forEach((file) => {
			const path = nodePath.normalize(`${_path}/${file}`)
			const ext = process.platform === 'linux' ? '.eml' : nodePath.extname(file)
			if (fs.statSync(path).isDirectory()) this.readRecursive(path)
			else if (ext === '.eml') this.processEml(path)
		})
	}

	handleNonExistingAddress(path: string) {
		// fs.rmSync(path)
	}

	processEml(path: string) {
		if (!fs.existsSync(path)) return
		const eml = fs.readFileSync(path, 'utf-8')
		simpleParser(eml, { skipImageLinks: true, skipTextToHtml: true }).then(async (data) => {
			let forwardedTo = null
			if (data.headers.has('x-forwarded-to'))
				forwardedTo = data.headers.get('x-forwarded-to')

			if (forwardedTo) {
				if (!forwardedTo.includes(`@${process.env.HOSTNAME}`)) return

				const address = await addressService.findByAddress(forwardedTo.split('@')[0])
				if (!address) return this.handleNonExistingAddress(path)

				this.saveMail(path, data, address)
			} else {
				if (!data.to) return this.handleNonExistingAddress(path)
				let foundRecipient = false
				// X-Original-To is added by our new mail server.
				data.to.value.push({
					address: (data.headers.get('x-original-to') || '').toLowerCase()
				})
				const found = []
				data.to.value.forEach(async (to, i) => {
					if (!to.address.includes(`@${process.env.HOSTNAME}`)) return

					const address = await addressService.findByAddress(to.address.split('@')[0])
					if (!address) {
						if ((i === data.to.length - 1) && !foundRecipient)
							return this.handleNonExistingAddress(path)
						return
					}

					foundRecipient = true
					if (!found.includes(address.id)) this.saveMail(path, data, address)
					found.push(address.id)
				})
			}
		}).catch(console.error)
	}

	async saveMail(path: string, data: any, address: AddressDocument) {
		let inReplyTo = null
		if (data.headers.has('in-reply-to'))
			inReplyTo = data.headers.get('in-reply-to')

		/* Thanks to this, inReplyTo will only exist if the mail is ACTUALLY a reply to another existing mail */
		if (inReplyTo) {
			const mail = await mailService.findByMessageId(String(address.ownerId), inReplyTo)
			if (!mail) inReplyTo = null
		}

		const attachments: Noonly.API.Data.MailAttachment[] = []
		data.attachments.forEach((_attachment) => {
			const attachmentId = randomToken(24)
			const attachmentPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/attachments/${attachmentId}-${_attachment.filename}`)
			fs.writeFileSync(attachmentPath, Buffer.from(_attachment.content))
			const attachment: Noonly.API.Data.MailAttachment = {
				filename: _attachment.filename,
				cid: _attachment.cid,
				related: _attachment.related,
				path: attachmentPath.split('\\').join('/'),
				id: attachmentId
			}
			attachments.push(attachment)
		})

		const illegalFromNames = ['no_reply', 'noreply']
		const origFromName = data.from.value[0].name
		const fromName = origFromName && !illegalFromNames.includes(origFromName.toLowerCase())
			? origFromName
			: data.from.value[0].address.split('@')[0]
		const from = `${fromName} <${data.from.value[0].address}>`

		const newMail = await mailService.create({
			ownerId: String(address.ownerId),
			subject: data.subject || '(No Subject)',
			previewText: data.text?.substr(0, 250) || '',
			sentToAddressId: address.id,
			from,
			to: `${address.name} <${address.address}@${process.env.HOSTNAME}>`,
			inReplyTo,
			dateReceived: new Date(),
			dateSent: new Date(Date.parse(data.date)),
			messageId: data.messageId
		})

		const mailPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/json/${newMail.id}.json`)
		const mailData = {
			attachments: attachments,
			html: data.html,
			text: data.text
		}
		fs.writeFileSync(mailPath, JSON.stringify(mailData, null, 2))

		const emlPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/eml/${newMail.id}.eml`)
		fs.copyFileSync(path, emlPath)

		fs.rmSync(path)

		getSocket()?.getSockets({ id: String(address.ownerId) } as UserDocument).forEach((socket) => {
			socket.emit('MAIL_INCOMING', { address: address.id })
		})
	}
}

export default MailFetcher