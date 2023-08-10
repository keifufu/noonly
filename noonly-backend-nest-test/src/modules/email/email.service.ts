import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'

@Injectable()
export default class EmailService {
	private nodemailerTransport: Mail

	constructor(
		private readonly configService: ConfigService
	) {
		this.nodemailerTransport = createTransport({
			host: configService.get('EMAIL_HOST'),
			port: configService.get('EMAIL_PORT'),
			secure: true,
			auth: {
				user: configService.get('EMAIL_USER'),
				pass: configService.get('EMAIL_PASSWORD')
			},
			tls: {
				rejectUnauthorized: false
			}
		})
	}

	sendMail(options: Mail.Options) {
		try {
			return this.nodemailerTransport.sendMail(options)
		} catch (error) {
			throw new InternalServerErrorException(error)
		}
	}
}