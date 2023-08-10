import { ConfigModule, ConfigService } from '@nestjs/config'

import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
	imports: [
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const srv = configService.get('MONGO_SRV')
				const username = configService.get('MONGO_USER')
				const password = configService.get('MONGO_PASSWORD')
				const host = configService.get('MONGO_HOST')
				const database = configService.get('MONGO_DATABASE')

				return {
					uri: `mongodb${srv ? '+srv' : ''}://${username}:${password}@${host}`,
					dbName: database,
					authSource: 'admin',
					retryWrites: true,
					w: 'majority',
					keepAlive: true,
					maxPoolSize: 25
				}
			}
		})
	]
})
export class DatabaseModule {}