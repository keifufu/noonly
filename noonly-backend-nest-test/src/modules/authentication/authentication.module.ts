import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { JwtRefreshTokenStrategy } from './jwt-refresh-token-strategy'
import { JwtStrategy } from './jwt.strategy'
import { JwtTwoFactorStrategy } from './jwt-two-factor.strategy'
import { LocalStrategy } from './local.strategy'
import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { TwoFactorAuthenticationController } from './twoFactor/twoFactorAuthentication.controller'
import { TwoFactorAuthenticationService } from './twoFactor/twoFactorAuthentication.service'
import { UsersModule } from '../users/users.module'
import { EmailConfirmationModule } from '../emailConfirmation/emailConfirmation.module'
import { SmsModule } from '../sms/sms.module'

@Module({
	imports: [
		UsersModule,
		PassportModule,
		ConfigModule,
		EmailConfirmationModule,
		SmsModule,
		JwtModule.register({})
	],
	providers: [AuthenticationService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy, TwoFactorAuthenticationService, JwtTwoFactorStrategy],
	controllers: [AuthenticationController, TwoFactorAuthenticationController],
	exports: [AuthenticationService]
})
export class AuthenticationModule {}