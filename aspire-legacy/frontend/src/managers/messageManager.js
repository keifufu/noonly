import { store, setChannel } from '../redux'
import handler from '../socket/handler'
const clone = require('rfdc')()

const handlers = {
	onMessageFetch: ({ channel_id, call, messages, total }) => {
		const { channels } = clone(store.getState())
		let channel = channels[channel_id]

		if(!channel) {
			channel = { id: channel_id, messages, total, call }
		} else {
			const currentMessages = channel.messages.filter(msg => {
				if(messages.find(e => e.id === msg.id)) return false
				return true
			})
			channel.messages = currentMessages.concat(messages)
			channel.total = total
			channel.id = channel_id
			channel.call = call
		}
		store.dispatch(setChannel(channel))
	},
	onMessageCreate: ({ channel_id, message }) => {
		const { channels } = clone(store.getState())
		let channel = channels[channel_id]

		if(!channel) {
			channel = { messages: [message], total: 1, call: [] }
		} else {
			const msg = channel.messages.find(msg => {
				if(msg.sent === false && msg.createdAt === message.createdAt) return true
				return false
			})
			if(msg) {
				channel.messages = channel.messages.filter(msg => msg.sent !== false && msg.createdAt !== message.createdAt)
				channel.messages.push(message)
			} else {
				channel.messages.push(message)
				channel.total += 1
			}
		}

		store.dispatch(setChannel(channel))
	},
	onMessageEdit: () => {
		// TODO
	},
	onMessageDelete: ({ channel_id, message }) => {
		const { channels } = clone(store.getState())
		const channel = channels[channel_id]

		if(!channel) return
		channel.messages = channel.messages.filter(msg => msg.id !== message.id)
		channel.total -= 1

		store.dispatch(setChannel(channel))
	}
}

const manager = {
	listen: () => {
		handler.register('FETCH_MESSAGES', handlers.onMessageFetch)
		handler.register('MESSAGE_CREATE', handlers.onMessageCreate)
		handler.register('MESSAGE_EDIT', handlers.onMessageEdit)
		handler.register('MESSAGE_DELETE', handlers.onMessageDelete)
	},
	stop: () => {
		handler.unregister('FETCH_MESSAGES', handlers.onMessageFetch)
		handler.unregister('MESSAGE_CREATE', handlers.onMessageCreate)
		handler.unregister('MESSAGE_EDIT', handlers.onMessageEdit)
		handler.unregister('MESSAGE_DELETE', handlers.onMessageDelete)
	},
	/*  */
	fetch: (channel_id, _options) => {
		const options = { amount: 50, before: undefined, after: undefined }
		if(_options?.amount) options.amount = _options.amount
		if(_options?.before) options.before = _options.before
		if(_options?.after) options.after = _options.after
		handler.emit('FETCH_MESSAGES', {
			channel_id: channel_id,
			amount: options.amount,
			before: options.before,
			after: options.after
		})
	},
	send: message => {
		handlers.onMessageCreate({ channel_id: message.channel_id, message: { ...message, id: Math.floor(Math.random() * 100), sent: false } })
		handler.emit('MESSAGE_CREATE', message)
	},
	delete: message => {
		handler.emit('MESSAGE_DELETE', message)
	}
}

export default manager