import nodemailer from 'nodemailer'
import { sendMailValidation } from '@main/database/validate'

export default {
	path: '/mail/send',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = sendMailValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		const [addressRow] = await store.database.mail.getAddressByIdAndAddress(user.id, address)
		if (!addressRow) return res.reject('Something went wrong')

		/* Don't use user.username again here. Use the name of the address before the @ */
		/* const message = {
			from: `"${addressRow.address}" <${addressRow.address}>`,
			to: recipients.join(','),
			subject: subject,
			html: html,
			text: text
		}

		const transporter = nodemailer.createTransport({
			host: 'localhost',
			port: 465,
			secure: true,
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PW
			},
			tls: { rejectUnauthorized: false }
		})

		transporter.verify(async (err, success) => {
			if (err) {
				console.error(err)
				return res.reject('Something went wrong')
			}
			await transporter.sendMail(message)
			res.sendRes({
				message: 'Successfully sent Mail'
			})
		}) */
	}
}