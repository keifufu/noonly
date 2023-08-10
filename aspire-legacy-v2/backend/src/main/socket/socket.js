import * as socketio from 'socket.io'
import fs from 'fs'

import dirname from '#library/utilities/dirname'
import store from '#main/store'
 
let handlers = {}
const __dirname = dirname()
async function createSocket(server) {
	const io = new socketio.Server({
		cors: {
			origin: '*',
			methods: ['GET', 'POST']
		},
		path: '/socket'
	})
	io.attach(server)

	io.sockets.on('connection', async (socket) => {
		const token = socket.handshake.query.token
		const location = socket.handshake.query.location
		const [userRow] = await store.database.users.getByToken(token)
		if(!userRow) return socket.disconnect()
		
		socket.handlers = handlers
		store.removeTimeout(userRow.id)
		store.addSocket(userRow.id, { user_id: userRow.id, socket_id: socket.id, socket })

		/* Emit online status to friends */
		const friendRows = await store.database.users.getFriendsById(userRow.id)
		friendRows.forEach((row) => {
			if (!store.hasSocket(row.friend_id)) return
			const friendSockets = store.getSockets(row.friend_id)
			friendSockets.forEach(({ socket }) => {
				socket.emit('FRIEND_CONNECT', userRow.id)
			})
		})

		/* Call registered event handler if existing for incoming event */
		socket.onAny((event, payload) => {
			const eventHandler = handlers[event]
			if(!eventHandler) return
			eventHandler(payload, store, socket, userRow.id)
		})

		/* Send initial data to user */
		handlers['FETCH_DATA']({ location }, store, socket, userRow.id, true)

		/* On socket disconnect */
		socket.on('disconnect', () => {
			store.removeSocket(socket)

			/* Set a timeout, after which the offline status will be emitted */
			/* The timeout will only be set if the disconnection socket was the last existing socket of the user */
			if(!store.hasSocket(userRow.id)) {
				store.setTimeout(userRow.id, setTimeout(async () => {
					const friendRows = await store.database.users.getFriendsById(userRow.id)
					friendRows.forEach((row) => {
						if (!store.hasSocket(row.friend_id)) return
						const friendSockets = store.getSockets(row.friend_id)
						friendSockets.forEach(({ socket }) => {
							socket.emit('FRIEND_DISCONNECT', userRow.id)
						})
					})
				}), 5000)
			}
		})
	})
}

fs.readdir(__dirname + '/handlers', (err, files) => {
	if (err) throw err
	files.forEach(async (file) => {
		if (fs.statSync(__dirname + `/handlers/${file}`).isDirectory()) {
			fs.readdir(__dirname + `/handlers/${file}`, (err, _files) => {
				if(err) throw err
				_files.forEach(async (_file) => {
					const module = await import(`file://${__dirname}/handlers/${file}/${_file}`)
					handlers[module.default.event] = module.default.execute
				})
			})
		} else {
			const module = await import(`file://${__dirname}/handlers/${file}`)
			handlers[module.default.event] = module.default.execute
		}
	})
})

export default createSocket