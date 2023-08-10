const socketIO = require('socket.io')
const fs = require('fs')

let io = null
let con = null
let users = {}
let rooms = {}
const handlers = {}
const timeouts = {}
const handler = {
	/**
	 * Create a socket
	 * @param {Object} server - http/https server instance
	 * @param {Object} sql_con - An SQL Connection
	 **/
	create(server, sql_con) {
		con = sql_con
		io = socketIO(server, { cors: { origin: '*' } })
		io.sockets.on('connection', async socket => {
			const token = socket.handshake.query.token
			const [user] = await con.query(`SELECT * FROM users WHERE token = ?`, [token])
			if(!user) return socket.disconnect()

			/* Clear existing timeout, which would make the user count as offline if executed */
			clearTimeout(timeouts[user.id])

			/* If user already has a connection */
			if(users[user.id] && users[user.id].length > 0) {
				users[user.id].push({ user_id: user.id, socket_id: socket.id, socket })
			} else {
				users[user.id] = [{ user_id: user.id, socket_id: socket.id, socket }]
				/* Emit online status to friends */
				const friendRows = await con.query(`SELECT * FROM friends WHERE user_id = ?`, user.id)
				friendRows.forEach(row => {
					const friendSockets = users[row.friend_id]
					if(!friendSockets || friendSockets.length === 0) return
					friendSockets.forEach(({ socket }) => {
						socket.emit('FRIEND_CONNECT', user.id)
					})
				})
			}

			/* Call registered event handler if existing for incoming event */
			socket.onAny((event, payload) => {
				const eventHandler = handlers[event]
				if(!eventHandler) return
				eventHandler(payload, con, socket, user.id)
			})
			
			/* On socket Disconnect */
			socket.on('disconnect', () => {
				/* Remove disconnecting socket from users */
				let disconnectingUser = null
				Object.keys(users).forEach(key => {
					const user = users[key].find(e => e.socket_id === socket.id)
					if(user) disconnectingUser = user
				})
				const { user_id } = disconnectingUser
				users[user_id].splice(users[user_id].indexOf(disconnectingUser), 1)

				/* Disconnect user from voice */
				const room = rooms[socket.id]
				if(room && room.roomId) {
					handlers['BE-leave-room']({ roomId: room.roomId }, con, socket, user_id)
				}

				/* Set a timeout, after which the offline status will be emitted */
				/* The timeout will only be set if the disconnection socket was the last existing socket of the user */
				if(users[user_id].length === 0) {
					timeouts[user_id] = setTimeout(async () => {
						const friendRows = await con.query(`SELECT * FROM friends WHERE user_id = ?`, user_id)
						friendRows.forEach(row => {
							const friendSockets = users[row.friend_id]
							if(!friendSockets || friendSockets.length === 0) return
							friendSockets.forEach(({ socket }) => {
								socket.emit('FRIEND_DISCONNECT', user.id)
							})
						})
					}, 5000)
				}
			})
		})
	},
	/**
	 * Register a socket handler
	 * @param {String} event - Event
	 * @param {Function} func - Function to execute
	 **/
	register(event, func) {
		handlers[event] = func
	},
	 /**
	 * Get currently connected user sockets
	 **/
	getUsers() {
		return users
	},
	/**
	* Set users
	* @param {Object} _users - Users
	**/
   setUsers(_users) {
	   users = _users
   },
	/**
	* Get rooms
	**/
	getRooms() {
		return rooms
	},
	/**
	 * Set rooms
	 * @param {Object} _rooms - Rooms
	 **/
	setRooms(_rooms) {
		rooms = _rooms
	}
}

fs.readdir(__dirname + '/handlers', (err, files) => {
	if(err) throw err
	files.forEach(file => {
		const module = require(__dirname + '/handlers/' + file)
		handler.register(module.event, (payload, con, socket, user_id) => module.execute(payload, con, socket, user_id, handler, io))
	})
})

module.exports = handler