module.exports = {
    event: 'BE-accept-call',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }, io) => {
        const { signal, to } = payload
        io.to(to).emit('FE-call-accepted', {
			signal,
			answerId: socket.id,
		})
    }
}