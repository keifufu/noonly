module.exports = {
    event: 'MESSAGE_CREATE',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }) => {
        const { channel_id, attachments, author, content, createdAt, editedAt, pinned } = payload
        const recipients = channel_id.split('_').map(id => parseInt(id))
        if(!recipients.includes(user_id)) return

        const query = `
            INSERT INTO messages
            (type, channel_id, attachments, author, content, createdAt, editedAt, pinned)
            VALUES
            ('0', '${channel_id}', '${attachments}', '${author}', ?, '${createdAt}', '${editedAt}', '${pinned}')
        `
        const res = await con.query(query, [content])

        const users = getUsers()
        recipients.forEach(id => {
            if(!users[id] || users[id].length === 0) return
            users[id].forEach(({ socket }) => {
                socket.emit('MESSAGE_CREATE', { channel_id, message: { id: res.insertId, type: 0, ...payload } })
            })
        })
    }
}