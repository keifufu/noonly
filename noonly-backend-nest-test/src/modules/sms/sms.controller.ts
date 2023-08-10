import { BadRequestException, Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common'

import CheckVerificationCodeDto from './dto/checkVerificationCode.dto'
import RequestWithUser from '../authentication/requestWithUser.interface'
import SmsService from './sms.service'
import JwtTwoFactorGuard from '../authentication/jwt-two-factor.guard'
import { RateLimit } from 'nestjs-rate-limiter'

@Controller('sms')
export default class SmsController {
	constructor(private readonly smsService: SmsService) {}

	// Only allow one request every 10 minutes. (Twilio codes expire after 10 minutes)
	@RateLimit({ points: 1, duration: 600, errorMessage: 'Please wait a while before retrying' })
	@Post('sendConfirmationCode')
	@UseGuards(JwtTwoFactorGuard)
	@HttpCode(200)
	async sendConfirmationCode(@Req() request: RequestWithUser) {
		if (request.user.isPhoneNumberConfirmed)
			throw new BadRequestException('Phone number already confirmed')

		const { phoneNumber } = request.user.toObject()
		await this.smsService.sendConfirmationCode(phoneNumber)
	}

	@RateLimit({ points: 10, duration: 60, errorMessage: 'Please wait a while before retrying' })
	@Post('validateConfirmationCode')
	@UseGuards(JwtTwoFactorGuard)
	@HttpCode(200)
	async validateConfirmationCode(@Req() request: RequestWithUser, @Body() verificationData: CheckVerificationCodeDto) {
		if (request.user.isPhoneNumberConfirmed)
			throw new BadRequestException('Phone number already confirmed')

		const { phoneNumber } = request.user.toObject()
		await this.smsService.confirmPhoneNumber(request.user.id, phoneNumber, verificationData.code)
	}
}