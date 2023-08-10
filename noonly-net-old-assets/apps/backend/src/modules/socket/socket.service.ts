import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import { SocketGateway } from './socket.gateway'

@Injectable()
export class SocketService {
	private socket: Server

	constructor(
		private readonly socketGateway: SocketGateway
	) {
		this.socket = socketGateway.server
	}

	emit(event: string, message: any) {
		this.socket.emit(event, message)
	}
}