import messageManager from './messageManager'
import { store, setFriend, removeFriend } from '../redux'
import handler from '../socket/handler'
import Api from '../Api'
const clone = require('rfdc')()

const utils = {
	fetch: () => {
		Api.friends.fetch().then(res => {
			const friends = res.map(friend => ({ ...friend, avatar: friend.avatar !== 'null' ? `https://aspire.icu${friend.avatar}` : null }))
			friends.forEach(friend => {
				store.dispatch(setFriend(friend))
				/* Preload messages from each chat */
				messageManager.fetch(friend.channel_id)
			})
		}).catch(console.log)
	}
}

const handlers = {
	onFriendAdd: user => {
		store.dispatch(setFriend(user))
	},
	onFriendRemove: user => {
		store.dispatch(removeFriend(user))
	},
	onFriendConnect: id => {
		const { friends } = clone(store.getState())
		const friend = friends[id]
		friend.isOnline = true
		store.dispatch(setFriend(friend))
	},
	onFriendDisconnect: id => {
		const { friends } = clone(store.getState())
		const friend = friends[id]
		friend.isOnline = false
		store.dispatch(setFriend(friend))
	}
}

const manager = {
	listen: () => {
		utils.fetch()
		handler.register('FRIEND_ADD', handlers.onFriendAdd)
		handler.register('FRIEND_REMOVE', handlers.onFriendRemove)
		handler.register('FRIEND_CONNECT', handlers.onFriendConnect)
		handler.register('FRIEND_DISCONNECT', handlers.onFriendDisconnect)
	},
	stop: () => {
		handler.unregister('FRIEND_ADD', handlers.onFriendAdd)
		handler.unregister('FRIEND_REMOVE', handlers.onFriendRemove)
		handler.unregister('FRIEND_CONNECT', handlers.onFriendConnect)
		handler.unregister('FRIEND_DISCONNECT', handlers.onFriendDisconnect)
	}
}

export default manager