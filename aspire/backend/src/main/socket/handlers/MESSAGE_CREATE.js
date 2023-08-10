export default {
	event: 'MESSAGE_CREATE',
	execute: async (payload, store, socket, user_id) => {
		const { channel_id, content, reply_id, id } = payload

		if (typeof channel_id !== 'string') return socket.emit('MESSAGE_CREATE_FAILED', id)
		if (typeof content !== 'string') return socket.emit('MESSAGE_CREATE_FAILED', id)
		if (content.length > 2048) return socket.emit('MESSAGE_CREATE_FAILED', id)
		if (typeof reply_id !== 'string' && reply_id !== null) return socket.emit('MESSAGE_CREATE_FAILED', id)

		await store.database.channels.insertMessage(user_id, channel_id, content, reply_id, id)
		const message = await store.database.channels.getMessageById(channel_id, id)

		socket.emit('MESSAGE_CREATE', message)
	}
}