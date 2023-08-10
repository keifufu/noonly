import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { InternalSocketService } from './internal-socket.service'

@WebSocketGateway()
export class SocketGateway {
	@WebSocketServer()
	server: Server

	constructor(private readonly socketService: InternalSocketService) {}

	async handleConnection(socket: Socket) {
		await this.socketService.getUserFromSocket(socket)
	}

	@SubscribeMessage('hello')
	listenForMessages(
		@MessageBody() data: string,
		@ConnectedSocket() socket: Socket
	) {
		socket.emit('hello_you', 'welcome')
		this.server.sockets.emit('hello from', data)
	}
}