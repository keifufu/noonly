module.exports = {
	route: '/friends/requests/cancel',
	middleware: false,
	type: 'post',
	execute: async (req, res, con, { getUsers, setUsers, getRooms, setRooms }) => {
        const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
        if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

        const [requestRow] = await con.query(`SELECT * FROM friend_requests WHERE user_id = '${userRow.id}' AND friend_id = '${req.body.id}'`)
        if(!requestRow) return res.send({ res: false, payload: 'Something went wrong' })

        con.query(`DELETE FROM friend_requests WHERE id = '${requestRow.id}'`)
		res.send({ res: true, payload: 'Cancelled Friend request' })

        const users = getUsers()
		const userSockets = users[userRow.id]
        const friendSockets = users[requestRow.friend_id]
        /* Emit FRIEND_REMOVE to user */
        if(userSockets && userSockets.length > 0) {
            userSockets.forEach(({ socket }) => {
                socket.emit('FRIEND_REMOVE', { id: requestRow.friend_id })
            })
        }
        /* Emit FRIEND_REMOVE to requested friend */
        if(friendSockets && friendSockets.length > 0) {
            friendSockets.forEach(({ socket }) => {
                socket.emit('FRIEND_REMOVE', { id: userRow.id })
            })
        }
	}
}