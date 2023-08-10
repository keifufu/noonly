import Joi from 'joi'
import nodemailer from 'nodemailer'
import addressService from '@main/database/services/Address.service'

// Have to do joi validation manually because we use form-data and the method
// we use to validate it normally fucks up with that
const verificationObj = Joi.object({
    fromAddressId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    to: Joi.string().required(),
    cc: Joi.string().allow('').optional(),
    bcc: Joi.string().allow('').optional(),
    subject: Joi.string().required(),
    text: Joi.string().allow('').optional(),
    html: Joi.string().allow('').optional()
}).required()

export default {
	path: '/smtp/send',
	type: 'POST',
	upload: {
		type: 'any'
	},
	protected: true,
	exec: async (req, res) => {
        try {
            await verificationObj.validateAsync(req.body)
        } catch(e) {
            return res.json({ success: false, message: 'Body verification failed' })
        }

        const userAddress = await addressService.findById(req.user.id, req.body.fromAddressId)
        if (!userAddress) return res.json({ success: false, message: 'Invalid address' })

        let attachments = []
        const files = (req.files as Array<any>) || []
        files.forEach((e) => {
            attachments.push({
                filename: e.originalname,
                path: e.path
            })
        })

        try {
            const transporter = nodemailer.createTransport({
                host: 'mail.noonly.net',
                port: 25,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                },
                tls: { 
                    rejectUnauthorized: false
                }
            } as any)
    
            transporter.sendMail({
                from: `${userAddress.name} <${userAddress.address}@noonly.net>`,
                to: req.body.to,
                cc: req.body.cc,
                bcc: req.body.bcc,
                subject: req.body.subject,
                text: req.body.text,
                html: req.body.html || req.body.text,
                attachments: attachments
            }).catch((e) => {
                console.error(e)
                if (!res.headersSent) {
                    res.json({
                        success: false,
                        message: e.responseCode === 554 ? 'Message is over 20MB' : 'Something went wrong'
                    })
                }
            }).then(() => {
                if (!res.headersSent) {
                    res.json({
                        success: true,
                        message: 'Sent mail!'
                    })
                }
            })
        } catch (e) {
            console.error(e)
            if (!res.headersSent) {
                res.json({
                    success: false,
                    message: e.responseCode === 554 ? 'Message is over 20MB' : 'Something went wrong'
                })
            }
        }
	}
} as Noonly.Express.RouteModule