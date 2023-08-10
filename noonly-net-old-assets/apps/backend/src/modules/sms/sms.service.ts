import { BadRequestException, Injectable } from '@nestjs/common'

import { ConfigService } from '@nestjs/config'
import { Twilio } from 'twilio'
import { UsersService } from '../users/users.service'

@Injectable()
export default class SmsService {
	private twilioClient: Twilio

	constructor(
		private readonly configService: ConfigService,
		private readonly usersService: UsersService
	) {
		const accountSid = configService.get('TWILIO_ACCOUNT_SID')
		const authToken = configService.get('TWILIO_AUTH_TOKEN')

		this.twilioClient = new Twilio(accountSid, authToken)
	}

	sendConfirmationCode(phoneNumber: string) {
		const serviceSid = this.configService.get('TWILIO_VERIFICATION_SERVICE_SID')

		return this.twilioClient.verify.services(serviceSid)
			.verifications
			.create({ to: phoneNumber, channel: 'sms' })
	}

	async confirmPhoneNumber(userId: string, phoneNumber: string, verificationCode: string) {
		const serviceSid = this.configService.get('TWILIO_VERIFICATION_SERVICE_SID')

		const result = await this.twilioClient.verify.services(serviceSid)
			.verificationChecks
			.create({ to: phoneNumber, code: verificationCode })

		if (!result.valid || result.status !== 'approved')
			throw new BadRequestException('Invalid code provided')

		await this.usersService.markPhoneNumberAsConfirmed(userId)
	}
}