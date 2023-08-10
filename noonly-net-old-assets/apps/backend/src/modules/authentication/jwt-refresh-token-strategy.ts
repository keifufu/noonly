import { ExtractJwt, Strategy } from 'passport-jwt'

import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import TokenPayload from './tokenPayload.interface'
import { UsersService } from '../users/users.service'

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh-token'
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly usersService: UsersService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => request?.cookies?.Refresh]),
			secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
			passReqToCallback: true
		})
	}

	validate(request: Request, payload: TokenPayload) {
		const refreshToken = request.cookies?.Refresh
		return this.usersService.getUserIfSessionExists(refreshToken, payload.userId)
	}
}