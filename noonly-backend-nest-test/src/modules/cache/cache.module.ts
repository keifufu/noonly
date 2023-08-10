import { Module, CacheModule as NestCacheModule, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as redisStore from 'cache-manager-redis-store'

@Global()
@Module({
	imports: [
		NestCacheModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				store: redisStore,
				host: configService.get('REDIS_HOST'),
				port: configService.get('REDIS_PORT'),
				ttl: 60 * 60 // 1 Hour
			})
		})
	],
	exports: [
		NestCacheModule
	]
})
export class CacheModule {}