import fetchMail from '#library/common/fetchMail'

const sockets = {}
const timeouts = {}
let isDevBuild = false
let database = null

class Store {
	get isDevBuild() {
		return isDevBuild
	}

	setDevBuild(devBuild) {
		isDevBuild = devBuild
	}

	setDatabase(db) {
		if (database) return
		database = db
		if (!isDevBuild)
			setInterval(fetchMail, 5 * 1000)
	}

	get database() {
		return database
	}

	setTimeout(id, timeout) {
		timeouts[id] = timeout
	}

	removeTimeout(id) {
		clearTimeout(timeouts[id])
	}

	get sockets() {
		return sockets
	}

	addSocket(user_id, socket) {
		if (this.hasSocket(user_id))
			sockets[user_id].push(socket)
		else
			sockets[user_id] = [socket]
	}

	hasSocket(user_id) {
		return (sockets[user_id] && sockets[user_id].length > 0)
	}

	getSockets(user_id) {
		return sockets[user_id]
	}

	removeSocket(_socket) {
		let disconnectingSocket = null
		Object.keys(sockets).forEach((key) => {
			const socket = sockets[key].find((e) => e.socket_id === _socket.id)
			if (socket) disconnectingSocket = socket
		})
		if (!disconnectingSocket) return
		const { user_id } = disconnectingSocket
		sockets[user_id] = sockets[user_id].splice(sockets[user_id].indexOf(disconnectingSocket), 1)
	}
}

const store = new Store()
export default store