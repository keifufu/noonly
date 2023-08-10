module.exports = {
	route: '/friends/fetch',
	middleware: false,
	type: 'post',
	execute: async (req, res, con, { getUsers, setUsers, getRooms, setRooms }) => {
        const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
        if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

        const users = getUsers()

        const friendRows = await con.query(`SELECT * FROM friends WHERE user_id = '${userRow.id}'`)
        const getFriends = new Promise(resolve => {
            const friends = []
            friendRows.forEach(async (row, index) => {
                const [userRow] = await con.query(`SELECT * FROM users WHERE id = '${row.friend_id}'`)
                delete userRow.token
                delete userRow.password
                delete userRow.ss_token
                userRow.channel_id = row.channel_id
                if(users[userRow.id] && users[userRow.id].length > 0) userRow.isOnline = true
                if(!userRow) con.query(`DELETE FROM friends WHERE id = '${row.id}'`)
                else friends.push(userRow)
                if(index === friendRows.length - 1) resolve(friends)
            })
            if(friendRows.length === 0) resolve(friends)
        })

        /* Requests */
        const incomingRequests = await con.query(`SELECT * FROM friend_requests WHERE friend_id = '${userRow.id}'`)
        const outgoingRequests = await con.query(`SELECT * FROM friend_requests WHERE user_id = '${userRow.id}'`)

        const getIncomingRequests = new Promise(resolve => {
            const requests = []
            incomingRequests.forEach(async (row, index) => {
                const [userRow] = await con.query(`SELECT * FROM users WHERE id = '${row.user_id}'`)
                userRow.incoming = true
                delete userRow.token
                delete userRow.password
                delete userRow.ss_token
                if(!userRow) con.query(`DELETE FROM friend_requests WHERE id = '${row.id}'`)
                else requests.push(userRow)
                if(index === incomingRequests.length - 1) resolve(requests)
            })
            if(incomingRequests.length === 0) resolve(requests)
        })

        const getOutgoingRequests = new Promise(resolve => {
            const requests = []
            outgoingRequests.forEach(async (row, index) => {
                const [userRow] = await con.query(`SELECT * FROM users WHERE id = '${row.friend_id}'`)
                userRow.outgoing = true
                delete userRow.token
                delete userRow.password
                delete userRow.ss_token
                if(!userRow) con.query(`DELETE FROM friend_requests WHERE id = '${row.id}'`)
                else requests.push(userRow)
                if(index === outgoingRequests.length - 1) resolve(requests)
            })
            if(outgoingRequests.length === 0) resolve(requests)
        })

        const friends = await getFriends
        const incoming = await getIncomingRequests
        const outgoing = await getOutgoingRequests

        incoming.forEach(request => friends.push(request) )
        outgoing.forEach(request => friends.push(request))

        res.send({ res: true, payload: friends })
	}
}