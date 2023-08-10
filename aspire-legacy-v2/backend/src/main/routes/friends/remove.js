export default {
	route: '/friends/remove',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { user_id } = req.body

		if (typeof user_id !== 'number') return res.reject('Invalid Request')

		const [friend] = await store.database.users.getById(user_id)
		if (!friend) return res.reject('This user doesnt exist')

		const [outgoingRequest] = await store.database.friends.getRequests(user.id, friend.id)

		/* Delete the private DM channel and remove participants */
		const [friends] = await store.database.friends.get(user.id, friend.id)
		if (!friends) return res.reject('Invalid Request')

		store.database.query('DELETE FROM channels WHERE id = ?', [friends.channel_id])
		store.database.query('DELETE FROM channel_participants WHERE channel_id = ?', [friends.channel_id])

		/* Remove Friend Requests */
		store.database.friends.removeRequest(user.id, friend.id)
		store.database.friends.removeRequest(friend.id, user.id)

		/* Delete Friendship */
		store.database.friends.remove(user.id, friend.id)
		store.database.friends.remove(friend.id, user.id)

		res.sendRes({
			message:
				outgoingRequest
					? 'Cancelled Friend Request'
					: `Removed '${friend.username}' from your Friends`,
			payload: { user_id }
		})
	}
}