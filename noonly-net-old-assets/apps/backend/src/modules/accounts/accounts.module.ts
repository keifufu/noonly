import * as redisStore from 'cache-manager-redis-store'

import { Account, AccountSchema } from './account.schema'
import { CacheModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AccountsController } from './accounts.controller'
import { AccountsService } from './accounts.service'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
		CacheModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				store: redisStore,
				host: configService.get('REDIS_HOST'),
				port: configService.get('REDIS_PORt'),
				ttl: 60 * 60 // 1 Hour
			})
		})
	],
	controllers: [AccountsController],
	providers: [AccountsService],
	exports: [AccountsService]
})
export class AccountsModule {}