module.exports = {
    event: 'VOICE_JOIN',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }) => {
        const { roomID } = payload
        const rooms = getRooms()
        if(rooms[roomID]) {
            rooms[roomID].push(socket.id)
        } else {
            rooms[roomID] = [socket.id]
        }
        setRooms(rooms)
        const filteredUsers = rooms[roomID].filter(id => id !== socket.id)
        socket.emit('VOICE_USERS', filteredUsers)
    }
}