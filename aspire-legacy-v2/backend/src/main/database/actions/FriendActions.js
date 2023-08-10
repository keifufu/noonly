class FriendActions {
	constructor(query) {
		this.query = query
	}

	get(user_id, friendId) {
		return this.query('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?', [user_id, friendId])
	}

	getAll(user_id) {
		return this.query('SELECT * FROM friends WHERE user_id = ?', [user_id])
	}

	remove(user_id, friendId) {
		return this.query('DELETE FROM friends WHERE user_id = ? AND friend_id = ?', [user_id, friendId])
	}

	getRequests(user_id, friendId) {
		return this.query('SELECT * FROM friend_requests WHERE user_id = ? AND friend_id = ?', [user_id, friendId])
	}

	getIncomingRequests(user_id) {
		return this.query('SELECT * FROM friend_requests WHERE friend_id = ?', [user_id])
	}

	getOutgoingRequests(user_id) {
		return this.query('SELECT * FROM friend_requests WHERE user_id = ?', [user_id])
	}

	removeRequest(user_id, friendId) {
		return this.query('DELETE FROM friend_requests WHERE user_id = ? AND friend_id = ?', [user_id, friendId])
	}

	deleteRequest(id) {
		return this.query('DELETE FROM friend_requests WHERE id = ?', [id])
	}

	getChannelId(user_id, friendId) {
		return this.query('SELECT * FROM friend_channel_id WHERE user_id = ? AND friend_id = ?', [user_id, friendId])
	}

	createChannelId(channelId, user_id, friendId) {
		return this.query(`
			INSERT INTO friend_channel_id
			(channel_id, user_id, friend_id)
			VALUES
			(?, ?, ?)
		`, [channelId, user_id, friendId])
	}

	add(user_id, friendId, channelId) {
		return this.query(`
			INSERT INTO friends
			(user_id, friend_id, channel_id)
			VALUES
			(?, ?, ?)
		`, [user_id, friendId, channelId])
	}

	sendRequest(user_id, friendId) {
		return this.query(`
			INSERT INTO friend_requests
			(user_id, friend_id)
			VALUES
			(?, ?)
		`, [user_id, friendId])
	}
}

export default FriendActions