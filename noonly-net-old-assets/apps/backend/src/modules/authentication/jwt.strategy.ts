import { ExtractJwt, Strategy } from 'passport-jwt'
import { Injectable, UnauthorizedException } from '@nestjs/common'

import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import TokenPayload from './tokenPayload.interface'
import { UsersService } from '../users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly usersService: UsersService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => request?.cookies?.Authentication]),
			secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
			passReqToCallback: true
		})
	}

	async validate(request: Request, payload: TokenPayload) {
		const user = await this.usersService.getUserById(payload.userId)

		if (!user.isPhoneNumberConfirmed && !request.path.startsWith('/sms/'))
			throw new UnauthorizedException('Phone number is not confirmed')

		/*
		 * JwtAuthenticationGuard is only being used on endpoints where a user needs to confirm 2FA of some sort.
		 * So if they are already twoFactorAuthenticated then they dont need access to those endpoints anymore
		 */
		if (payload.isTwoFactorAuthenticated)
			throw new UnauthorizedException('You are already authenticated')

		return user
	}
}