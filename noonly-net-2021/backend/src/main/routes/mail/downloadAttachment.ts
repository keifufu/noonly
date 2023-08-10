import Joi from 'joi'
import fs from 'fs'
import mailService from '@main/database/services/Mail.service'
import nodePath from 'path'

export default {
	path: '/mail/downloadAttachment',
	type: 'GET',
	protected: true,
	/* validate: Joi.object({
		mailId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		attachmentId: Joi.string().regex(/^[0-9a-zA-Z]{24}$/).required()
	}), */
	exec: async (req, res) => {
		// const { body }: { body: Noonly.API.Request.MailDownloadAttachment } = req

		if (!req.query.mailId || !req.query.attachmentId) return res.status(400).json({ error: 'fuck yourself' })

		const body = { mailId: req.query.mailId as string, attachmentId: req.query.attachmentId as string }

		const mail = await mailService.findById(req.user.id, body.mailId)
		if (!mail) return res.status(400).json({ error: 'Something went wrong' })

		const jsonPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/json/${mail.id}.json`)
		if (!fs.existsSync(jsonPath)) return res.status(400).json({ error: 'Something went wrong' })

		const content = JSON.parse(fs.readFileSync(jsonPath).toString())
		const attachment = content.attachments.find((attachment: Noonly.API.Data.MailAttachment) => attachment.id === body.attachmentId)
		if (!attachment) return res.status(400).json({ error: 'Something went wrong' })

		const attachmentPath = nodePath.normalize(attachment.path)
		if (!fs.existsSync) return res.status(400).json({ error: 'Something went wrong' })

		res.download(attachmentPath)
	}
} as Noonly.Express.RouteModule