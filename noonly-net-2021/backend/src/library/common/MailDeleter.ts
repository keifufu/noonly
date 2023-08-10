import { MailDocument } from '@main/database/models/Mail.model'
import { UserDocument } from '@main/database/models/User.model'
import fs from 'fs'
import mailService from '@main/database/services/Mail.service'
import nodePath from 'path'

interface MailDeleterDone {
	[id: string]: boolean
}

class MailDeleter {
	user: UserDocument

	deleted: string[]

	done: MailDeleterDone

	constructor(user: UserDocument) {
		this.user = user
		this.deleted = []
		this.done = {}
	}

	deleteMultiple(ids: string[]): Promise<string[]> {
		ids.forEach((id) => {
			this.done[id] = false
			this.deleteMail(id)
		})
		return new Promise((resolve) => {
			const checkFlag = () => {
				let allTrue = true
				Object.values(this.done).forEach((e) => {
					if (e === false) allTrue = false
				})
				if (allTrue) resolve(this.deleted)
				else setTimeout(checkFlag, 50)
			}
			checkFlag()
		})
	}

	async deleteMail(id: string): Promise<void> {
		const deletedMail = await mailService.findOneAndDelete(this.user.id, id)
		if (!deletedMail) {
			this.done[id] = true
			return
		}

		this.deleted.push(id)

		const jsonPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/json/${deletedMail.id}.json`)
		const emlPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/eml/${deletedMail.id}.eml`)

		let jsonMail: any = {}
		if (fs.existsSync(jsonPath)) {
			jsonMail = JSON.parse(fs.readFileSync(jsonPath).toString())
			fs.rmSync(jsonPath)
		}
		if (fs.existsSync(emlPath)) fs.rmSync(emlPath)

		/* This part doesn't work. */
		if (jsonMail.attachments) {
			jsonMail.attachments.forEach((attachment: Noonly.API.Data.MailAttachment) => {
				if (fs.existsSync(attachment.path))
					fs.rmSync(attachment.path)
			})
		}
		this.recursivelyDeleteReplies(deletedMail)
	}

	async recursivelyDeleteReplies(deletedMail: MailDocument): Promise<void> {
		const replies = await mailService.findReplies(this.user.id, deletedMail.messageId)
		replies.forEach((mail) => {
			this.deleteMail(mail.id)
		})
		this.done[deletedMail.id] = true
	}
}

export default MailDeleter