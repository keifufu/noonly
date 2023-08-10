import * as Joi from '@hapi/joi'

import { AccountsModule } from './modules/accounts/accounts.module'
import { AuthenticationModule } from './modules/authentication/authentication.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DatabaseModule } from './modules/database/database.module'
import { Module } from '@nestjs/common'
import { SocketModule } from './modules/socket/websocket.module'
import { UsersModule } from './modules/users/users.module'
import { RateLimiterGuard, RateLimiterModule } from 'nestjs-rate-limiter'
import { APP_GUARD } from '@nestjs/core'
import * as redis from 'redis'
import { SmsModule } from './modules/sms/sms.module'
import { CacheModule } from './modules/cache/cache.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
	imports: [
		ConfigModule.forRoot({
			cache: true,
			isGlobal: true,
			validationSchema: Joi.object({
				PORT: Joi.number().required(),
				MONGO_SRV: Joi.boolean().required(),
				MONGO_USER: Joi.string().required(),
				MONGO_PASSWORD: Joi.string().required(),
				MONGO_HOST: Joi.string().required(),
				MONGO_DATABASE: Joi.string().required(),
				JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
				JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.number().required(),
				JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
				JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.number().required(),
				TWO_FACTOR_AUTHENTICATION_APP_NAME: Joi.string().required(),
				CORS_ORIGIN: Joi.string().required(),
				TWILIO_ACCOUNT_SID: Joi.string().required(),
				TWILIO_AUTH_TOKEN: Joi.string().required(),
				TWILIO_VERIFICATION_SERVICE_SID: Joi.string().required(),
				REDIS_HOST: Joi.string().required(),
				REDIS_PORT: Joi.number().required(),
				JWT_EMAIL_VERIFICATION_TOKEN_SECRET: Joi.string().required(),
				JWT_EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME: Joi.number().required(),
				EMAIL_CONFIRMATION_URL: Joi.string().required(),
				EMAIL_HOST: Joi.string().required(),
				EMAIL_PORT: Joi.number().required(),
				EMAIL_USER: Joi.string().required(),
				EMAIL_PASSWORD: Joi.string().required(),
				IS_USING_PROXY: Joi.boolean().required()
			})
		}),
		DatabaseModule,
		UsersModule,
		AccountsModule,
		AuthenticationModule,
		SocketModule,
		SmsModule,
		RateLimiterModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				for: 'Express',
				type: 'Redis',
				storeClient: redis.createClient({
					host: configService.get('REDIS_HOST'),
					port: configService.get('REDIS_PORT')
				})
			})
		}),
		CacheModule,
		ScheduleModule.forRoot()
	],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: RateLimiterGuard
		}
	]
})
export class AppModule {}