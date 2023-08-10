class ChannelActions {
	constructor(query) {
		this.query = query
	}

	insertMessage(author_id, channel_id, content, reply_id, id) {
		return this.query(`
			INSERT INTO messages
			(author_id, channel_id, content, createdAt, editedAt, pinned, reply_id, id)
			VALUES
			(?, ?, ?, ?, NULL, FALSE, ?, ?)
		`, [author_id, channel_id, content, Date.now(), reply_id, id])
	}

	getMessageById(channel_id, id) {
		return this.query('SELECT * FROM messages WHERE channel_id = ? AND id = ?', [channel_id, id])
	}

	getLast50Messages(channel_id) {
		return this.query('SELECT * FROM messages WHERE channel_id = ? ORDER BY createdAt ASC LIMIT 50', [channel_id])
	}

	getFirstMessage(channel_id) {
		return this.query('SELECT * FROM messages WHERE channel_id = ? ORDER BY createdAt DESC LIMIT 1', [channel_id])
	}

	getLastMessage(channel_id) {
		return this.query('SELECT * FROM messages WHERE channel_id = ? ORDER BY createdAt ASC LIMIT 1', [channel_id])
	}
}

export default ChannelActions