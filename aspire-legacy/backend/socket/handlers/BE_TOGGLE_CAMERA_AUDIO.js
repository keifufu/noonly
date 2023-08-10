module.exports = {
    event: 'BE-toggle-camera-audio',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }, io) => {
        const { roomId, switchTarget } = payload
        const rooms = getRooms()
        if(switchTarget === 'video') {
			rooms[socket.id].video = !rooms[socket.id].video
		} else {
			rooms[socket.id].audio = !rooms[socket.id].audio
		}
		socket.broadcast.to(roomId).emit('FE-toggle-camera', { userId: socket.id, switchTarget })
    }
}