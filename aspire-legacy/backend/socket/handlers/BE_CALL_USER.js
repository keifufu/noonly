module.exports = {
    event: 'BE-call-user',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }, io) => {
        const { userToCall, from, signal } = payload
        const rooms = getRooms()
        io.to(userToCall).emit('FE-receive-call', {
			signal,
			from,
			info: rooms[socket.id],
		})
    }
}