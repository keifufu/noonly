module.exports = {
    event: 'VOICE_LEAVE',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }, io) => {
        /* Find ID of the Room that the user is currently in */
        let roomID = null
        let rooms = getRooms()
        Object.keys(rooms).forEach(key => {
            const socketID = rooms[key].find(e => e === socket.id)
            if(socketID) roomID = key
        })
        
        let room = rooms[roomID]
        if(room) {
            room = room.filter(id => id !== socket.id)
            rooms[roomID] = room
            setRooms(rooms)
            room.forEach(id => {
                io.to(id).emit('VOICE_LEAVE', { id: socket.id })
            })
        }
    }
}