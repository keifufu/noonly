module.exports = {
    event: 'VOICE_RETURN_SIGNAL',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }, io) => {
        const { callerID, signal } = payload
        io.to(callerID).emit('VOICE_RECEIVING_SIGNAL', { signal, id: socket.id })
    }
}