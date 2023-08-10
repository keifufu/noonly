import { AuthenticationModule } from '../authentication/authentication.module'
import { InternalSocketService } from './internal-socket.service'
import { Module } from '@nestjs/common'
import { SocketGateway } from './socket.gateway'
import { SocketService } from './socket.service'

@Module({
	imports: [
		AuthenticationModule
	],
	providers: [SocketGateway, SocketService, InternalSocketService]
})
export class SocketModule {}