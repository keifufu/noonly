import nodemailer from 'nodemailer'

export default {
	route: '/mail/send',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { address, subject, recipients, html, text } = req.body

		if (subject.length < 1) return res.reject('Subject must be at least 1 character long')
		if (subject.length > 255) return res.reject('Subject can\'t be longer than 255 characters')
		if (recipients.length === 0) return res.reject('Please specify a Recipient')

		const [addressRow] = await store.database.mail.getAddressByIdAndAddress(user.id, address)
		if (!addressRow) return res.reject('Something went wrong')

		const message = {
			from: `"${user.username}" <${addressRow.address}>`,
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
				console.log(err)
				return res.reject('Something went wrong')
			}
			await transporter.sendMail(message)
			res.sendRes({
				message: 'Successfully sent Mail'
			})
		})
	}
}