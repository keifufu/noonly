const nodemailer = require('nodemailer')
module.exports = {
	route: '/inbox/send',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
        const { mail: _mail } = req.body
        const mail = JSON.parse(_mail)
        if(typeof mail !== 'object') return res.send({ res: false, payload: 'Something went wrong' })
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
        if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
		const [mailRow] = await con.query(`SELECT * FROM mail_accounts WHERE account_username = '${userRow.username}' AND address = '${mail.address}'`)
		if(!mailRow) return res.send({ res: false, payload: 'Something went wrong' })
        
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PW
            },
            tls: { rejectUnauthorized: false }
        })
        
        const { to, subject, text, html, /* attachments,  */replyTo, inReplyTo, } = mail
        const message = {
            from: `"${mailRow.address.split('@')[0]}" <${mailRow.address}>`, 
            to,
            subject,
            text,
            html
        }
        // if(attachments) message.attachments = attachments
        if(replyTo) message.replyTo = replyTo
        if(inReplyTo) message.inReplyTo = inReplyTo

        transporter.verify(async (err, success) => {
            if(err) return res.send({ res: false, payload: err.message })
            if(!success) return res.send({ res: false, payload: 'Something went wrong' })
            const info = await transporter.sendMail(message)
            res.send({ res: true, payload: 'Sent message!' })
        })
	}
}