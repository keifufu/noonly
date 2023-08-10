import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import SmsController from './sms.controller'
import SmsService from './sms.service'
import { UsersModule } from '../users/users.module'

@Module({
	imports: [ConfigModule, UsersModule],
	controllers: [SmsController],
	providers: [SmsService],
	exports: [SmsService]
})
export class SmsModule {}