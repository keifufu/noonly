module.exports = {
    event: 'VOICE_SEND_SIGNAL',
    execute: async (payload, con, socket, user_id, { getUsers, setUsers, getRooms, setRooms }, io) => {
        const { userToSignal, callerID, signal } = payload
        io.to(userToSignal).emit('VOICE_JOIN', { signal, callerID })
    }
}