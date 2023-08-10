module.exports = {
	route: '/friends/requests/accept',
	middleware: false,
	type: 'post',
	execute: async (req, res, con, { getUsers, setUsers, getRooms, setRooms }) => {
        const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
        if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

        const [requestRow] = await con.query(`SELECT * FROM friend_requests WHERE user_id = '${req.body.id}' AND friend_id = '${userRow.id}'`)
        if(!requestRow) return res.send({ res: false, payload: 'Something went wrong' })

        con.query(`DELETE FROM friend_requests WHERE id = '${requestRow.id}'`)

        const ids = [userRow.id, requestRow.user_id].sort((a, b) => a - b)
        const channel_id = `${ids[0]}_${ids[1]}`

        con.query(`INSERT INTO friends (user_id, friend_id, channel_id) VALUES ('${userRow.id}', '${requestRow.user_id}', '${channel_id}')`)
        con.query(`INSERT INTO friends (user_id, friend_id, channel_id) VALUES ('${requestRow.user_id}', '${userRow.id}', '${channel_id}')`)
        res.send({ res: true, payload: 'Accepted Friend request' })
        
        const users = getUsers()
        const userSockets = users[userRow.id]
        const friendSockets = users[requestRow.user_id]
        /* FRIEND_ADD replaces any existing users on the client side with the newly sent user */
        /* Emit FRIEND_ADD to user */
        if(userSockets && userSockets.length > 0) {
            const [friendRow] = await con.query(`SELECT * FROM users WHERE id = '${requestRow.user_id}'`)
            delete friendRow.token
            delete friendRow.password
            delete friendRow.ss_token
            friendRow.channel_id = channel_id
            if(friendSockets && friendSockets.length > 0) friendRow.isOnline = true
            userSockets.forEach(({ socket }) => {
                socket.emit('FRIEND_ADD', friendRow)
            })
        }
        /* Emit FRIEND_UPDATE to requested friend */
        if(friendSockets && friendSockets.length > 0) {
            delete userRow.token
            delete userRow.password
            delete userRow.ss_token
            userRow.channel_id = channel_id
            if(userSockets && userSockets.length > 0) userRow.isOnline = true
            friendSockets.forEach(({ socket }) => {
                socket.emit('FRIEND_ADD', userRow)
            })
        }
	}
}