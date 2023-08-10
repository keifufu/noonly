module.exports = {
    event: 'FETCH_MESSAGES',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }) => {
        const { channel_id, amount, after, before, cancel } = payload
        if(!channel_id) return
        const recipients = channel_id.split('_').map(id => parseInt(id))
        if(!recipients.includes(user_id)) return

        const query = `
            SELECT * FROM messages
            WHERE channel_id = ?
            ${ 
                after && typeof after === 'number'
                ? `AND id > ${after}`
                : before && typeof before === 'number'
                ? `AND id < ${before}`
                : ''
            }
            ORDER BY id DESC LIMIT ${typeof amount === 'number' ? amount : 50}
        `

        const messages = await con.query(query, [channel_id])
        const total = await con.query(`SELECT channel_id FROM messages WHERE channel_id = ?`, [channel_id])
        
        const call = []
        const rooms = getRooms()
        Object.values(rooms).forEach(({ roomId, user_id }) => {
            if(roomId === payload.channel_id) call.push(user_id)
        })

        /* Since this is FETCH_MESSAGES, we dont want to send updates to all sockets of current user */
        /* So we will only send it to the socket who emitted the event */
        socket.emit('FETCH_MESSAGES', { channel_id, call, messages, total: total.length })
    }
}