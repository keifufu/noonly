import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'

import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import RegisterDto from './dto/register.dto'
import TokenPayload from './tokenPayload.interface'
import { UsersService } from '../users/users.service'
import { Request } from 'express'
import argon2, { argon2id } from 'argon2'
import RequestWithUser from './requestWithUser.interface'
import { sha256 } from 'js-sha256'
import { UserDocument } from '../users/user.schema'

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly usersService: UsersService,
		private	readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	public async register(registerDto: RegisterDto) {
		try {
			const hashedPassword = await argon2.hash(registerDto.password, { type: argon2id })
			const createdUser = await this.usersService.create({
				...registerDto,
				password: hashedPassword
			})
			return createdUser
		} catch (error) {
			throw new InternalServerErrorException(error)
		}
	}

	public getCookieWithJwtAccessToken(userId: string, isTwoFactorAuthenticated = false) {
		const payload: TokenPayload = { userId, isTwoFactorAuthenticated }
		const token = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
			expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
		})
		return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`
	}

	public getCookieWithJwtRefreshToken(userId: string) {
		const payload: TokenPayload = { userId }
		const token = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
			expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`
		})
		const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`
		return {
			cookie,
			token
		}
	}

	public getCookiesForLogOut() {
		return [
			'Authentication=; HttpOnly; Path=/; Max-Age=0',
			'Refresh=; HttpOnly; Path=/; Max-Age=0'
		]
	}

	public async getAuthenticatedUser(username: string, plainTextPassword: string) {
		const user = await this.usersService.getUserByUsername(username)
		const validPassword = await this.verifyPassword(user?.password, plainTextPassword)

		if (!validPassword)
			throw new UnauthorizedException('Invalid login credentials')

		return user
	}

	public async verifyPassword(hashedPassword: string, plainTextPassword: string) {
		try {
			if (await argon2.verify(hashedPassword, plainTextPassword, { type: argon2id }))
				return true
			return false
		} catch (error) {
			throw new InternalServerErrorException('Invalid login credentials')
		}
	}

	public getUserFromAuthenticationToken(token: string) {
		if (!token) return

		const payload: TokenPayload = this.jwtService.verify(token, {
			secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
		})

		if (payload.userId)
			return this.usersService.getUserById(payload.userId)
	}

	public getJwtTokenContentFromRequest(request: Request) {
		const jwtToken = request?.cookies?.Authentication
		if (!jwtToken) return

		const payload: TokenPayload = this.jwtService.verify(jwtToken, {
			secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
			ignoreExpiration: true
		})

		return payload
	}

	public getSessionFromRequest(request: RequestWithUser) {
		const currentSession = request.user.sessions.find((session) => session.hashedRefreshToken === sha256(request.cookies?.Refresh))
		return currentSession
	}

	public getEnabledTwoFAMethods(user: UserDocument) {
		const TwoFAMethods = []
		if (user.isGAuthEnabled)
			TwoFAMethods.push('G-Auth')
		if (user.usePhoneNumberFor2FA)
			TwoFAMethods.push('SMS')
		if (user.isSecondaryEmailVerified)
			TwoFAMethods.push('EMAIL')
		return TwoFAMethods
	}
}