import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, HttpCode, Inject, Post, Query, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common'

import { AuthenticationService } from '../authentication.service'
import JwtAuthenticationGuard from '../jwt-authentication.guard'
import MongooseClassSerializerInterceptor from 'src/utils/MongooseClassSerializer.interceptor'
import RequestWithUser from '../requestWithUser.interface'
import { Response } from 'express'
import { TwoFactorAuthenticationCodeDto } from './dto/twoFactorAuthenticationCode.dto'
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service'
import { User } from 'src/modules/users/user.schema'
import { UsersService } from 'src/modules/users/users.service'
import JwtTwoFactorGuard from '../jwt-two-factor.guard'
import AddSecondaryEmailDto from './dto/AddSecondaryEmailDto.dto'
import { EmailConfirmationService } from 'src/modules/emailConfirmation/emailConfirmation.service'
import { Cache } from 'cache-manager'
import randomToken from 'src/utils/randomToken'
import SmsService from 'src/modules/sms/sms.service'
import { RateLimit } from 'nestjs-rate-limiter'
import PasswordDto from './dto/PasswordDto.dto'
import { TwoFactorBackupCodeDto } from './dto/TwoFactorBackupCodeDto'

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly usersService: UsersService,
		private readonly authenticationService: AuthenticationService,
		private readonly emailConfirmationService: EmailConfirmationService,
		private readonly smsService: SmsService,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache
	) {}

	@Post('generateGAuthSecret')
	@UseGuards(JwtTwoFactorGuard)
	async generateGAuthSecret(@Res() response: Response, @Req() request: RequestWithUser, @Query('setupKey') setupKey: string) {
		const { secret, otpauthUrl } = await this.twoFactorAuthenticationService.generateGAuthSecret(request.user)
		if (setupKey === 'true')
			response.status(201).json({ setupKey: secret })
		else
			this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl)
	}

	@Post('enableGAuth')
	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	async enableGAuth(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto
	) {
		if (request.user.isGAuthEnabled)
			throw new UnauthorizedException('2FA is already enabled')

		const isCodeValid = this.twoFactorAuthenticationService.isGAuthCodeValid(
			twoFactorAuthenticationCode, request.user
		)

		if (!isCodeValid)
			throw new UnauthorizedException('Invalid authentication code')

		await this.usersService.enableGAuth(request.user.id)

		// Update access token to include `isTwoFactorAuthenticated`
		const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true)
		request.res.setHeader('Set-Cookie', [accessTokenCookie])
	}

	@Post('disableGAuth')
	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	async disableGAuth(
		@Req() request: RequestWithUser,
		@Body() { password } : PasswordDto
	) {
		if (!request.user.isGAuthEnabled)
			throw new UnauthorizedException('2FA is not enabled')

		// this should check either the gauth code or the backup code but NOT the password
		const isPasswordValid = await this.authenticationService.verifyPassword(request.user.password, password)
		if (!isPasswordValid)
			throw new UnauthorizedException('Invalid Password provided')

		await this.usersService.disableGAuth(request.user.id)
	}

	@Post('authenticateWithGAuth')
	@HttpCode(200)
	@UseInterceptors(MongooseClassSerializerInterceptor(User))
	@UseGuards(JwtAuthenticationGuard)
	async authenticateWithGAuth(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto
	) {
		const isCodeValid = this.twoFactorAuthenticationService.isGAuthCodeValid(
			twoFactorAuthenticationCode, request.user
		)

		if (!isCodeValid)
			throw new UnauthorizedException('Invalid authentication code')

		const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true)
		const session = this.authenticationService.getSessionFromRequest(request)

		const { authenticatedSession } = session
		if (!authenticatedSession)
			await this.usersService.authenticateSession(session.id)

		request.res.set({ 'Session-Id': session?.id })
		request.res.setHeader('Set-Cookie', [accessTokenCookie])

		// Refetch user if session had to be authenticated
		if (authenticatedSession)
			return request.user
		else
			return await this.usersService.getUserById(request.user.id)
	}

	@Post('enableSmsAuth')
	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	async enableSmsAuth(
		@Req() request: RequestWithUser,
		@Body() { password }: PasswordDto
	) {
		if (!request.user.isPhoneNumberConfirmed)
			throw new BadRequestException('Phone number is not yet confirmed')
		if (request.user.usePhoneNumberFor2FA)
			throw new BadRequestException('SMS Verification is already turned on')

		const isPasswordValid = await this.authenticationService.verifyPassword(request.user.password, password)
		if (!isPasswordValid)
			throw new UnauthorizedException('Invalid Password provided')

		// TODO: allow this for paid users in the future
		throw new UnauthorizedException('SMS Auth is currently disabled')

		// await this.usersService.turnOnSmsAuthentication(request.user.id)

		// Update access token to include `isTwoFactorAuthenticated`
		// const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true)
		// request.res.setHeader('Set-Cookie', [accessTokenCookie])
	}

	@Post('disableSmsAuth')
	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	async disableSmsAuth(
		@Req() request: RequestWithUser,
		@Body() { password }: PasswordDto
	) {
		if (!request.user.usePhoneNumberFor2FA)
			throw new BadRequestException('SMS Verification is not turned on')

		const isPasswordValid = await this.authenticationService.verifyPassword(request.user.password, password)
		if (!isPasswordValid)
			throw new UnauthorizedException('Invalid Password provided')

		await this.usersService.turnOffSmsAuthentication(request.user.id)
	}

	// Only allow one request every 10 minutes. (Twilio codes expire after 10 minutes)
	@RateLimit({ points: 1, duration: 600, errorMessage: 'Please wait a while before retrying' })
	@Post('sendSmsAuthCode')
	@HttpCode(200)
	@UseGuards(JwtAuthenticationGuard)
	async sendSmsAuthCode(@Req() request: RequestWithUser) {
		if (!request.user.usePhoneNumberFor2FA)
			throw new UnauthorizedException('2FA via SMS is not enabled')

		const { phoneNumber } = request.user.toObject()
		await this.smsService.sendConfirmationCode(phoneNumber)
	}

	@RateLimit({ points: 10, duration: 60, errorMessage: 'Please wait a while before retrying' })
	@Post('authenticateWithSms')
	@HttpCode(200)
	@UseInterceptors(MongooseClassSerializerInterceptor(User))
	@UseGuards(JwtAuthenticationGuard)
	async authenticateWithSms(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto
	) {
		if (!request.user.usePhoneNumberFor2FA)
			throw new UnauthorizedException('2FA via SMS is not enabled')

		const { phoneNumber } = request.user.toObject()
		// Throws an error if code is not valid
		await this.smsService.confirmPhoneNumber(request.user.id, phoneNumber, twoFactorAuthenticationCode)

		const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true)
		const session = this.authenticationService.getSessionFromRequest(request)

		const { authenticatedSession } = session
		if (!authenticatedSession)
			await this.usersService.authenticateSession(session.id)

		request.res.set({ 'Session-Id': session?.id })
		request.res.setHeader('Set-Cookie', [accessTokenCookie])

		// Refetch user if session had to be authenticated
		if (authenticatedSession)
			return request.user
		else
			return await this.usersService.getUserById(request.user.id)
	}

	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	@Post('addSecondaryEmail')
	async addSecondaryEmail(@Req() request: RequestWithUser, @Body() addSecondaryEmailDto: AddSecondaryEmailDto) {
		if (request.user.isSecondaryEmailVerified)
			throw new BadRequestException('There is already a secondary email linked to this account')
		await this.usersService.addSecondaryEmail(request.user.id, addSecondaryEmailDto.email)
		await this.emailConfirmationService.sendVerificationLink(addSecondaryEmailDto.email)
	}

	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	@Post('removeSecondaryEmail')
	async removeSecondaryEmail(
		@Req() request: RequestWithUser,
		@Body() { password }: PasswordDto
	) {
		if (!request.user.secondaryEmail)
			throw new BadRequestException('No secondary email is linked to this account')

		const isPasswordValid = await this.authenticationService.verifyPassword(request.user.password, password)
		if (!isPasswordValid)
			throw new UnauthorizedException('Invalid Password provided')

		await this.usersService.removeSecondaryEmail(request.user.id)
	}

	@HttpCode(200)
	@UseGuards(JwtAuthenticationGuard)
	@Post('sendEmailAuthCode')
	sendEmailAuthCode(@Req() request: RequestWithUser) {
		if (!request.user.isSecondaryEmailVerified)
			throw new UnauthorizedException('Unverified email')

		const code = randomToken(6, 'abcdefghijklmnopqrstuvwxyz0123456789')
		this.cacheManager.set(`${request.user.id}-2faEmailCode`, code)
		const { secondaryEmail } = request.user.toObject()
		this.emailConfirmationService.sendCode(secondaryEmail, code)
	}

	@HttpCode(200)
	@UseGuards(JwtAuthenticationGuard)
	@UseInterceptors(MongooseClassSerializerInterceptor(User))
	@Post('authenticateWithEmail')
	async authenticateWithEmail(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto
	) {
		if (!request.user.isSecondaryEmailVerified)
			throw new UnauthorizedException('Unverified email')

		if (await this.cacheManager.get(`${request.user.id}-2faEmailCode`) !== twoFactorAuthenticationCode)
			throw new UnauthorizedException('Invalid or expired authentication code')

		const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true)
		const session = this.authenticationService.getSessionFromRequest(request)

		const { authenticatedSession } = session
		if (!authenticatedSession)
			await this.usersService.authenticateSession(session.id)

		request.res.set({ 'Session-Id': session?.id })
		request.res.setHeader('Set-Cookie', [accessTokenCookie])

		// Refetch user if session had to be authenticated
		if (authenticatedSession)
			return request.user
		else
			return await this.usersService.getUserById(request.user.id)
	}

	@HttpCode(200)
	@UseGuards(JwtAuthenticationGuard)
	@UseInterceptors(MongooseClassSerializerInterceptor(User))
	@Post('authenticateWithBackupCode')
	async authenticateWithBackupCode(
		@Req() request: RequestWithUser,
		@Body() { backupCode }: TwoFactorBackupCodeDto
	) {
		const TwoFAMethods = this.authenticationService.getEnabledTwoFAMethods(request.user)
		if (TwoFAMethods.length === 0)
			throw new UnauthorizedException('2FA is not enabled on this account')

		// Throws an error if its not valid
		await this.usersService.validateBackupCode(request.user.id, backupCode)

		const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true)
		const session = this.authenticationService.getSessionFromRequest(request)

		const { authenticatedSession } = session
		if (!authenticatedSession)
			await this.usersService.authenticateSession(session.id)

		request.res.set({ 'Session-Id': session?.id })
		request.res.setHeader('Set-Cookie', [accessTokenCookie])

		// Refetch user if session had to be authenticated
		if (authenticatedSession)
			return request.user
		else
			return await this.usersService.getUserById(request.user.id)
	}

	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	@Post('generateNewBackupCodes')
	async generateNewBackupCodes(
		@Req() request: RequestWithUser,
		@Body() { password }: PasswordDto
	) {
		const TwoFAMethods = this.authenticationService.getEnabledTwoFAMethods(request.user)
		if (TwoFAMethods.length === 0)
			throw new UnauthorizedException('2FA is not enabled on this account')

		const isPasswordValid = await this.authenticationService.verifyPassword(request.user.password, password)
		if (!isPasswordValid)
			throw new UnauthorizedException('Invalid Password provided')

		const backupCodes = await this.usersService.generateNewBackupCodes(request.user.id)
		return backupCodes
	}

	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	@Post('requestBackupCodes')
	async requestBackupCodes(
		@Req() request: RequestWithUser,
		@Body() { password }: PasswordDto
	) {
		const TwoFAMethods = this.authenticationService.getEnabledTwoFAMethods(request.user)
		if (TwoFAMethods.length === 0)
			throw new UnauthorizedException('2FA is not enabled on this account')

		const isPasswordValid = await this.authenticationService.verifyPassword(request.user.password, password)
		if (!isPasswordValid)
			throw new UnauthorizedException('Invalid Password provided')

		return request.user.backupCodes
	}
}