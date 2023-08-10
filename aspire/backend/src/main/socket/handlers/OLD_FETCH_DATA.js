/* eslint-disable multiline-comment-style */
import nodePath from 'path'
import fs from 'fs'

export default {
	event: 'OLD_FETCH_DATA',
	execute: async (payload, store, socket, user_id, localRequest) => {
		/* This should not be getting emitted from the client so we'll make sure only local requests are allowed */
		if (!localRequest) return

		/**
		 * From now on, this will only fetch important data,
		 * for example data needed to display badges in the sidebar.
		 * All other data will be fetched client-side when needed
		 */

		/* Friends */
		const friendRows = await store.database.friends.getAll(user_id)
		const getFriends = new Promise((resolve) => {
			const friends = []
			friendRows.forEach(async (row, index) => {
				const [user] = await store.database.users.getById(row.friend_id)
				const friend = {
					id: user.id,
					username: user.username,
					isOnline: false
				}
				if (store.hasSocket(friend.id))
					friend.isOnline = true

				friends.push(friend)
				if (index === friendRows.length - 1) resolve(friends)
			})
			if (friendRows.length === 0) resolve(friends)
		})

		/* Friend Requests */
		const incomingRequests = await store.database.friends.getIncomingRequests(user_id)
		const outgoingRequests = await store.database.friends.getOutgoingRequests(user_id)

		const getIncomingRequests = new Promise((resolve) => {
			const requests = []
			incomingRequests.forEach(async (row, index) => {
				const [user] = await store.database.users.getById(row.user_id)
				const friend = {
					id: user.id,
					username: user.username,
					requestType: 'incoming'
				}
				requests.push(friend)
				if (index === incomingRequests.length - 1) resolve(requests)
			})
			if (incomingRequests.length === 0) resolve(requests)
		})

		const getOutgoingRequests = new Promise((resolve) => {
			const requests = []
			outgoingRequests.forEach(async (row, index) => {
				const [user] = await store.database.users.getById(row.friend_id)
				const friend = {
					id: user.id,
					username: user.username,
					requestType: 'outgoing'
				}
				requests.push(friend)
				if (index === outgoingRequests.length - 1) resolve(requests)
			})
			if (outgoingRequests.length === 0) resolve(requests)
		})

		const friends = {}
		const _friends = await getFriends
		const incoming = await getIncomingRequests
		const outgoing = await getOutgoingRequests

		incoming.forEach((request) => _friends.push(request))
		outgoing.forEach((request) => _friends.push(request))

		_friends.forEach((friend) => {
			friends[friend.id] = friend
		})

		/* Channel / Channel Participants */
		const channelRows = await store.database.query('SELECT * FROM channel_participants WHERE user_id = ?', [user_id])
		const getChannels = new Promise((resolve) => {
			const channels = {}
			channelRows.forEach(async (row, i) => {
				const [channel] = await store.database.query('SELECT * FROM channels WHERE id = ?', [row.channel_id])
				const participantRows = await store.database.query('SELECT * FROM channel_participants WHERE channel_id = ?', [channel.id])
				const _participants = participantRows.map(async (row) => {
					const [user] = await store.database.users.getById(row.user_id)
					return {
						id: user.id,
						username: user.username
					}
				})
				const participants = await Promise.all(_participants)
				const messageRows = await store.database.channels.getLast50Messages(channel.id)
				const getMessages = new Promise((resolve) => {
					const messages = {}
					messageRows.forEach((row, i) => {
						messages[row.id] = row

						if (i === messageRows.length - 1) resolve(messages)
					})
					if (messageRows.length === 0) resolve(messages)
				})
				const messages = await getMessages
				const [firstMessage] = await store.database.channels.getFirstMessage(channel.id)
				const [lastMessage] = await store.database.channels.getLastMessage(channel.id)
				channels[channel.id] = {
					...channel,
					participants,
					messages,
					firstMessageId: firstMessage?.id,
					lastMessageId: lastMessage?.id
				}

				if (i === channelRows.length - 1) resolve(channels)
			})
			if (channelRows.length === 0) resolve(channels)
		})

		const channels = await getChannels

		/* Inbox / Mail */
		const added = []
		const findMail = (obj, mail) => {
			let found = null
			Object.values(obj).forEach((e) => {
				if (e.messageId === mail.inReplyTo) found = e
				if (e.replies) {
					const res = findMail(e.replies, mail)
					e.replies = res
				}
			})
			if (found) {
				if (!Array.isArray(found.replies)) found.replies = []
				found.replies.push(mail)
				added.push(mail)
			}
			return obj
		}

		const mail = {}
		const mailAccounts = await store.database.users.getMailAccountsById(user_id)
		const mailRows = await store.database.mail.getAll()
		mailAccounts.forEach((row) => {
			const accountMail = []
			mailRows.filter((e) => e.to_address.toLowerCase() === row.address.toLowerCase())
				.forEach((row) => {
					const path = nodePath.normalize(`${process.env.DATA_DIR}/mail/${row.id}.json`)
					if (!fs.existsSync(path)) return
					const mail = JSON.parse(fs.readFileSync(path))
					Object.keys(row).forEach((key) => {
						const blacklisted = ['user_id', 'from_address', 'to_address', 'in_reply_to']
						if (blacklisted.includes(key)) return
						mail[key] = row[key]
					})
					accountMail.push(mail)
				})

			let sortedMail = {}
			accountMail.forEach((mail) => {
				if (mail.inReplyTo) {
					sortedMail = findMail(sortedMail, mail)
				} else {
					sortedMail[mail.id] = mail
					added.push(mail)
				}
			})

			accountMail.forEach((mail) => {
				if (!added.find((e) => e.messageId === mail.messageId))
					sortedMail[mail.id] = mail
			})
			mail[row.address.toLowerCase()] = sortedMail
		})

		const _unread = {}
		Object.keys(mail).forEach((address) => {
			const unread = Object.values(mail[address]).filter((e) => !e.isread && !e.trash)
			_unread[address] = unread.length
		})
		mail.unread = _unread

		/* Passwords */
		const passwords = {}
		const passwordRows = await store.database.passwords.getAll(user_id)
		passwordRows.forEach((row) => {
			passwords[row.id] = row
		})

		/* Screenshots */
		const screenshots = {}
		const screenshotRows = await store.database.screenshots.getAll(user_id)
		screenshotRows.forEach((row) => {
			screenshots[row.id] = row
		})

		/* Cloud */
		const cloud = {}
		const cloudRows = await store.database.cloud.getAll(user_id)
		cloudRows.forEach((row) => {
			cloud[row.id] = {
				...row,
				sharedKey: null,
				sharedPassword: ''
			}
		})

		const sharedCloudRows = await store.database.cloud.getAllShared(user_id)
		sharedCloudRows.forEach((row) => {
			if (!cloud[row.file_id]) return
			cloud[row.file_id].sharedKey = row.id
			cloud[row.file_id].sharedPassword = row.password || ''
		})

		/**
		 * Emit Data to the socket who connected
		 * IMPORTANT:
		 * Don't send this data to all connected clients by this user
		 */
		const data = {
			mail,
			cloud,
			friends,
			channels,
			passwords,
			screenshots
		}
		socket.emit('DATA_FETCHED', data)
	}
}