module.exports = {
    event: 'BE-leave-room',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }, io) => {
        const rooms = getRooms()
        delete rooms[socket.id]
        setRooms(rooms)

        const users = getUsers()

        if(payload) {
            const { roomId } = payload
            socket.broadcast.to(roomId).emit('FE-user-leave', { userId: socket.id })
            socket.leave(roomId)
            /* Parse roomId and send VOICE_LEAVE to each participant */
            const participantIds = roomId.split('_')
            participantIds.forEach(id => {
                const sockets = users[id]
                if(!sockets) return
                sockets.forEach(({ socket }) => {
                    socket.emit('VOICE_LEAVE', user_id)
                })
            })
        } else {
            Array.from(socket.rooms).filter(e => e !== socket.id).forEach(roomId => {
                socket.broadcast.to(roomId).emit('FE-user-leave', { userId: socket.id })
                socket.leave(roomId)
                /* Parse roomId and send VOICE_LEAVE to each participant */
                const participantIds = roomId.split('_')
                participantIds.forEach(id => {
                    const sockets = users[id]
                    if(!sockets) return
                    sockets.forEach(({ socket }) => {
                        socket.emit('VOICE_LEAVE', user_id)
                    })
                })
            })
        }
    }
}