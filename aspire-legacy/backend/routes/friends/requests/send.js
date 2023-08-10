module.exports = {
	route: '/friends/requests/send',
	middleware: false,
	type: 'post',
	execute: async (req, res, con, { getUsers, setUsers, getRooms, setRooms }) => {
        /* General Authenticated */
        const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
        if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
        const users = getUsers()

        /* Check if requested Friend exists */
        const [friendRow] = await con.query(`SELECT * FROM users WHERE username = '${req.body.username}'`)
        if(!friendRow) return res.send({ res: false, payload: 'This User doesn\'t exist' })
        
        /* Dont allow making requests to yourself */
        if(userRow.id === friendRow.id) return res.send({ res: false, payload: 'You can\'t send a request to yourself' })

        /* Check if these two Users are already Friends */
        const [rowOfFriendTable] = await con.query(`SELECT * FROM friends WHERE user_id = '${userRow.id}' AND friend_id = '${friendRow.id}'`)
        if(rowOfFriendTable) return res.send({ res: false, payload: `You are already Friends with '${friendRow.username}'` })

        /* Check if an request towards the requested friend already exists */
        const [requestRow] = await con.query(`SELECT * FROM friend_requests WHERE user_id = '${userRow.id}' AND friend_id = '${friendRow.id}'`)
        if(requestRow) return res.send({ res: false, payload: 'Already sent a request to this user' })

        /* Check if an request FROM the requested friend already exists and accept it is so */
        const [requestRowTwo] = await con.query(`SELECT * FROM friend_requests WHERE user_id = '${friendRow.id}' AND friend_id = '${userRow.id}'`)
        if(requestRowTwo) {
            con.query(`DELETE FROM friend_requests WHERE id = '${requestRowTwo.id}'`)
            const ids = [requestRowTwo.user_id, requestRowTwo.friend_id].sort((a, b) => a - b)
            const channel_id = `${ids[0]}_${ids[1]}`

            con.query(`INSERT INTO friends (user_id, friend_id, channel_id) VALUES ('${requestRowTwo.user_id}', '${requestRowTwo.friend_id}', '${channel_id}')`)
            con.query(`INSERT INTO friends (user_id, friend_id, channel_id) VALUES ('${requestRowTwo.friend_id}', '${requestRowTwo.user_id}', '${channel_id}')`)

            const userSockets = users[userRow.id]
            const friendSockets = users[friendRow.id]
            /* Emit FRIEND_ADD to user */
            if(userSockets && userSockets.length > 0) {
                delete friendRow.token
                delete friendRow.password
                delete friendRow.ss_token
                friendRow.channel_id = channel_id
                if(friendSockets && friendSockets.length > 0) friendRow.isOnline = true
                userSockets.forEach(({ socket }) => {
                    socket.emit('FRIEND_ADD', friendRow)
                })
            }
            /* Emit FRIEND_ADD to requested friend */
            if(friendSockets && friendSockets.length > 0) {
                delete userRow.token
                delete userRow.password
                delete friendRow.ss_token
                userRow.channel_id = channel_id
                if(userSockets && userSockets.length > 0) userRow.isOnline = true
                friendSockets.forEach(({ socket }) => {
                    socket.emit('FRIEND_ADD', userRow)
                })
            }

            return res.send({ res: true, payload: `Added '${friendRow.username}' as a friend` })
        }

        con.query(`INSERT INTO friend_requests (user_id, friend_id) VALUES ('${userRow.id}', '${friendRow.id}')`)
        res.send({ res: true, payload: `Sent Friend request to '${friendRow.username}'` })

        const userSockets = users[userRow.id]
        const friendSockets = users[friendRow.id]
        /* Emit FRIEND_ADD to user */
        if(userSockets && userSockets.length > 0) {
            delete friendRow.token
            delete friendRow.password
            friendRow.outgoing = true
            userSockets.forEach(({ socket }) => {
                socket.emit('FRIEND_ADD', friendRow)
            })
        }
        /* Emit FRIEND_ADD to requested friend */
        if(friendSockets && friendSockets.length > 0) {
            delete userRow.token
            delete userRow.password
            userRow.incoming = true
            friendSockets.forEach(({ socket }) => {
                socket.emit('FRIEND_ADD', userRow)
            })
        }
	}
}