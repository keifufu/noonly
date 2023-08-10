import randomID from '#library/utilities/randomID'

export default {
	route: '/friends/add',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { username } = req.body

		if (typeof username !== 'string') return res.reject('Invalid Request')

		const [friend] = await store.database.users.getByUsername(username)
		if (!friend) return res.reject('This user doesn\'t exist')

		if (friend.id === user.id) return res.reject('You can\'t send a request to yourself')

		const [friendRow] = await store.database.friends.get(user.id, friend.id)
		if (friendRow) return res.reject(`You are already Friends with ${friend.username}`)

		const [outgoingRequest] = await store.database.friends.getRequests(user.id, friend.id)
		if (outgoingRequest) return res.reject(`Already sent a request to ${friend.username}`)

		const [incomingRequest] = await store.database.friends.getRequests(friend.id, user.id)
		if (incomingRequest) {
			const [friendChannelId] = await store.database.friends.getChannelId(user.id, friend.id)
			const channelId = friendChannelId?.channel_id || await randomID(24, 'friend_channel_id', 'channel_id')

			if (!friendChannelId) {
				store.database.friends.createChannelId(channelId, user.id, friend.id)
				store.database.friends.createChannelId(channelId, friend.id, user.id)
			}

			store.database.friends.deleteRequest(incomingRequest.id)
			store.database.friends.add(user.id, friend.id, channelId)
			store.database.friends.add(friend.id, user.id, channelId)

			/* Create a DM channel and add both users as participants */
			const query2 = `
				INSERT INTO channels
				(owner_id, name, type, icon, id)
				VALUES
				(NULL, NULL, 'DM', NULL, ?)
			`
			store.database.query(query2, [channelId])

			const query3 = `
				INSERT INTO channel_participants
				(channel_id, user_id)
				VALUES
				(?, ?)
			`
			store.database.query(query3, [channelId, user.id])
			store.database.query(query3, [channelId, friend.id])
		} else {
			store.database.friends.sendRequest(user.id, friend.id)
		}

		const payload = {
			id: friend.id,
			username: friend.username
		}
		if (!incomingRequest)
			payload.requestType = 'outgoing'

		res.sendRes({
			message:
				incomingRequest
					? `Accepted ${friend.username}'s Friend Request`
					: `Sent a request to '${friend.username}'`,
			payload: payload
		})
	}
}