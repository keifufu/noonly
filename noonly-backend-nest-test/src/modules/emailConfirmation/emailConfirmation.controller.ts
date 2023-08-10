import { ClassSerializerInterceptor, Controller, Get, HttpCode, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common'
import JwtTwoFactorGuard from '../authentication/jwt-two-factor.guard'
import RequestWithUser from '../authentication/requestWithUser.interface'
import { EmailConfirmationService } from './emailConfirmation.service'

@Controller('email-confirmation')
@UseInterceptors(ClassSerializerInterceptor)
export class EmailConfirmationController {
	constructor(
		private readonly emailConfirmationService: EmailConfirmationService
	) {}

	@Get('confirm')
	async confirm(@Query('token') token: string) {
		const email = await this.emailConfirmationService.decodeConfirmationToken(token)
		await this.emailConfirmationService.confirmEmail(email)

		return 'Email confirmed!'
	}

	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	@Post('resendConfirmation')
	async resendConfirmationLink(@Req() request: RequestWithUser) {
		await this.emailConfirmationService.resendConfirmationLink(request.user.id)
	}
}