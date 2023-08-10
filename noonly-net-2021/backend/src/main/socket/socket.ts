import * as socketio from 'socket.io'

import { UserDocument } from '@main/database/models/User.model'
import authorize from '@main/middleware/authorize'
import handlers from './handlers/index'
import https from 'https'
import http from 'http'

let socket: Socket | null = null
const createSocket = (httpsServer: https.Server, httpServer: http.Server): void => {
	socket = new Socket(httpsServer, httpServer)
}

class Socket {
	private handlers: Noonly.Socket.SocketHandlers

	private sockets: Noonly.Socket.Sockets

	private io: socketio.Server | null

	constructor(httpsServer: https.Server, httpServer: http.Server) {
		this.createSocket(httpsServer, httpServer)
		this.handlers = {}
		this.sockets = {}
		this.io = null
		this.registerHandlers()
	}

	createSocket(httpsServer: https.Server, httpServer: http.Server) {
		this.io = new socketio.Server({
			cors: {
				origin: '*',
				methods: ['GET', 'POST']
			},
			path: '/socket'
		})
		if (process.env.USE_SSL === 'true')
			this.io.attach(httpsServer)
		else
			this.io.attach(httpServer)
		this.registerConnect()
	}

	registerHandlers() {
		handlers.forEach((handler) => {
			this.handlers[handler.event] = handler.exec
		})
	}

	registerConnect() {
		this.io?.use(authorize)
		this.io?.sockets.on('connection', (socket: Noonly.Socket.Socket) => {
			const { location } = socket.request.headers
			this.addSocket(socket)

			socket.handlers = this.handlers
			socket.onAny((event: string, data: any) => {
				const eventHandler = this.handlers[event]
				if (!eventHandler) return
				eventHandler(data, socket)
			})

			/* Send initial data to the socket */
			this.handlers.LOAD_DATA({ location }, socket, true)

			socket.on('disconnect', () => {
				this.removeSocket(socket)
			})
		})
	}

	addSocket(socket: Noonly.Socket.Socket) {
		if (this.hasSocket(socket.user))
			this.sockets[socket.user.id].push(socket)
		else
			this.sockets[socket.user.id] = [socket]
	}

	hasSocket(user: UserDocument) {
		return (this.sockets[user.id] && this.sockets[user.id].length > 0)
	}

	getSockets(user: UserDocument) {
		if (this.hasSocket(user))
			return this.sockets[user.id]
		else return []
	}

	removeSocket(socket: Noonly.Socket.Socket) {
		this.sockets[socket.user.id] = this.sockets[socket.user.id].filter((e) => e.id !== socket.id)
	}
}

const getSocket = () => socket

export { getSocket as default, createSocket }