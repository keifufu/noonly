module.exports = {
    event: 'BE-join-room',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }, io) => {
        const { roomId, userName } = payload
        socket.join(roomId)

        const rooms = getRooms()
		rooms[socket.id] = { roomId, userName, user_id, video: false, audio: true }
        setRooms(rooms)

        const ids = await io.sockets.in(roomId).allSockets()
        const _users = []
        ids.forEach(id => {
            _users.push({ userId: id, info: rooms[id] })
        })
        socket.broadcast.to(roomId).emit('FE-user-join', { users: _users })

        /* Parse roomId and send VOICE_JOIN to each participant */
        const participantIds = roomId.split('_')
        const users = getUsers()
        participantIds.forEach(id => {
            const sockets = users[id]
            if(!sockets) return
            sockets.forEach(({ socket }) => {
                socket.emit('VOICE_JOIN', user_id)
            })
        })
    }
}