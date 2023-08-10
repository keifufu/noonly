import { BadRequestException, Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common'

import { AuthenticationService } from './authentication.service'
import JwtRefreshGuard from './jwt-refresh.guard'
import MongooseClassSerializerInterceptor from 'src/utils/MongooseClassSerializer.interceptor'
import RegisterDto from './dto/register.dto'
import RequestWithUser from './requestWithUser.interface'
import { User } from '../users/user.schema'
import { UsersService } from '../users/users.service'
import { LocalAuthenticationGuard } from './local-authentication.guard'
import { Request } from 'express'
import applyUserAgentAliases from 'src/utils/applyUserAgentAliases'
import JwtTwoFactorGuard from './jwt-two-factor.guard'
import DeleteSessionDto from './dto/deleteSession.dto'
import getIpFromRequest from 'src/utils/getIpFromRequest'
import { RateLimit } from 'nestjs-rate-limiter'
import { ConfigService } from '@nestjs/config'

@Controller('authentication')
export class AuthenticationController {
	constructor(
		private readonly authenticationService: AuthenticationService,
		private readonly usersService: UsersService,
		private readonly configService: ConfigService
	) {}

	@HttpCode(201)
	@UseInterceptors(MongooseClassSerializerInterceptor(User))
	@Post('register')
	async register(@Req() request: Request, @Body() registerDto: RegisterDto) {
		if (!registerDto.acceptedTerms)
			throw new BadRequestException('You need to acknowledge our Terms of Service and Privacy Notice')

		const user = await this.authenticationService.register(registerDto)

		const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(user.id)
		const {
			cookie: refreshTokenCookie,
			token: refreshToken
		} = this.authenticationService.getCookieWithJwtRefreshToken(user.id)

		let ipAddress = getIpFromRequest(request)
		if (ipAddress.substr(0, 7) === '::ffff:')
			ipAddress = ipAddress.substr(7)
		const userAgent = applyUserAgentAliases(request.headers['user-agent'])
		const session = await this.usersService.createSession(refreshToken, userAgent, ipAddress, user.id, true)

		request.res.set({ 'Session-Id': session?.id })
		request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie])

		// Refetch the user to include created session
		return await this.usersService.getUserById(user.id)
	}

	@HttpCode(200)
	@UseGuards(LocalAuthenticationGuard)
	@UseInterceptors(MongooseClassSerializerInterceptor(User))
	@Post('login')
	async login(@Req() request: RequestWithUser) {
		const { user } = request
		const TwoFAMethods = this.authenticationService.getEnabledTwoFAMethods(user)

		const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(user.id)
		const {
			cookie: refreshTokenCookie,
			token: refreshToken
		} = this.authenticationService.getCookieWithJwtRefreshToken(user.id)

		let ipAddress = getIpFromRequest(request)
		if (ipAddress.substring(0, 7) === '::ffff:')
			ipAddress = ipAddress.substring(7)
		const userAgent = applyUserAgentAliases(request.headers['user-agent'])
		const session = await this.usersService.createSession(refreshToken, userAgent, ipAddress, user.id, TwoFAMethods.length === 0)

		request.res.set({ 'Session-Id': session?.id })
		request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie])

		request.res.set({ '2FA-Methods': JSON.stringify(TwoFAMethods) })
		if (TwoFAMethods.includes('EMAIL'))
			request.res.set({ '2FA-Email': request.user.secondaryEmail })
		if (TwoFAMethods.length > 0)
			return

		// Refetch the user to include created session
		return await this.usersService.getUserById(user.id)
	}

	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	@Post('logout')
	async logout(@Req() request: RequestWithUser) {
		await this.usersService.removeSession(request.user.id, request.cookies?.Refresh)
		request.res.setHeader('Set-Cookie', this.authenticationService.getCookiesForLogOut())
	}

	@UseGuards(JwtRefreshGuard)
	@UseInterceptors(MongooseClassSerializerInterceptor(User))
	@Get('refresh')
	async refresh(@Req() request: RequestWithUser, @Query('user') withUser: string) {
		const TwoFAMethods = this.authenticationService.getEnabledTwoFAMethods(request.user)
		const tokenPayload = this.authenticationService.getJwtTokenContentFromRequest(request)
		const wasTwoFactorAuthenticated = tokenPayload?.isTwoFactorAuthenticated ? TwoFAMethods.length > 0 : false
		const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, wasTwoFactorAuthenticated)
		const session = this.authenticationService.getSessionFromRequest(request)
		const cookies = [accessTokenCookie]

		const sessionTokenLastUpdatedUnix = Math.floor(Date.parse(session?.updatedAt.toString()) / 1000)
		const currentTimeUnix = Math.floor(Date.now() / 1000)
		const timeSinceLastUpdateInSeconds = currentTimeUnix - sessionTokenLastUpdatedUnix
		const refreshExpirationTime = this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
		const oneDayInSeconds = 86400
		// Update refresh token if it is about to expire in less than one day
		if (timeSinceLastUpdateInSeconds + oneDayInSeconds >= refreshExpirationTime) {
			const {
				cookie: refreshTokenCookie,
				token: refreshToken
			} = this.authenticationService.getCookieWithJwtRefreshToken(request.user.id)
			cookies.push(refreshTokenCookie)
			await this.usersService.refreshSessionById(session?.id, refreshToken)
		}

		request.res.set({ 'Session-Id': session?.id })
		request.res.setHeader('Set-Cookie', cookies)
		if (withUser === 'true') {
			// If user has 2FA enabled, and a user was requested without the jwt token being twoFactorAuthenticated, dont return the user
			if (TwoFAMethods.length === 0)
				return request.user
			if (TwoFAMethods.length > 0 && wasTwoFactorAuthenticated)
				return request.user
		}
	}

	@HttpCode(200)
	@UseGuards(JwtTwoFactorGuard)
	@Post('deleteSession')
	async deleteSession(@Req() request: RequestWithUser, @Body() deleteSessionDto: DeleteSessionDto) {
		await this.usersService.removeSession(request.user.id, deleteSessionDto.sessionId)
	}

	@HttpCode(201)
	@Get('form')
	form(@Req() request: Request) {
		const getCsrfToken = (request as any).csrfToken
		return {
			csrfToken: typeof getCsrfToken === 'function' ? getCsrfToken() : ''
		}
	}

	@RateLimit({ keyPrefix: 'a', points: 3, duration: 60, errorMessage: 'You are being throttled' })
	@Get('a')
	a(@Req() request: RequestWithUser) {
		console.log(getIpFromRequest(request))
	}
}