import { ExtractJwt, Strategy } from 'passport-jwt'

import { ConfigService } from '@nestjs/config'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import TokenPayload from './tokenPayload.interface'
import { UsersService } from '../users/users.service'

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
	Strategy,
	'jwt-two-factor'
) {
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

		// Accept user as authenticated if GAuth, Email 2FA and SMS 2FA is not enabled
		if (!user.isGAuthEnabled && !user.secondaryEmail && !user.usePhoneNumberFor2FA)
			return user
		// Otherwise only if they got a new JWT from a 2FA endpoint
		if (payload.isTwoFactorAuthenticated)
			return user
	}
}