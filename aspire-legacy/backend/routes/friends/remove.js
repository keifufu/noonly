module.exports = {
	route: '/friends/remove',
	middleware: false,
	type: 'post',
	execute: async (req, res, con, { getUsers, setUsers, getRooms, setRooms }) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		const [friendRow] = await con.query(`SELECT * FROM users WHERE id = '${req.body.id}'`)
		if(!friendRow) return res.send({ res: false, payload: 'User doesn\'t exist' })

		con.query(`DELETE FROM friends WHERE user_id = '${userRow.id}' AND friend_id = '${friendRow.id}'`)
		con.query(`DELETE FROM friends WHERE user_id = '${friendRow.id}' AND friend_id = '${userRow.id}'`)

		res.send({ res: true, payload: `Removed ${friendRow.username} from your Friends` })

		const users = getUsers()
		const userSockets = users[userRow.id]
        const friendSockets = users[friendRow.id]
        /* Emit FRIEND_REMOVE to user */
        if(userSockets && userSockets.length > 0) {
			userSockets.forEach(({ socket }) => {
				socket.emit('FRIEND_REMOVE', { id: friendRow.id })
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