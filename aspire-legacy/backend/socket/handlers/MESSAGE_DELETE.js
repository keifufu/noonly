module.exports = {
    event: 'MESSAGE_DELETE',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }) => {
        const { channel_id, id } = payload
        const recipients = channel_id.split('_').map(id => parseInt(id))
        if(!recipients.includes(user_id)) return
        /* Probably make sure the user wanting to delete is the message author, not just apart of the chat */
        
        const query = `
            DELETE FROM messages
            WHERE id = ?
        `
        con.query(query, [id])

        const users = getUsers()
        recipients.forEach(id => {
            if(!users[id] || users[id].length === 0) return
            users[id].forEach(({ socket }) => {
                socket.emit('MESSAGE_DELETE', { channel_id, message: payload })
            })
        })
    }
}