import post from 'main/axios/post'
import socket from 'main/socket'
import rfdc from 'rfdc'
const clone = rfdc()

export default {
	state: {},
	reducers: {
		set: (state, payload) => payload,
		addMessages: (state, payload) => {
			const clonedState = clone(state)
			payload.messages.forEach((message) => {
				clonedState[payload.channel_id].messages[message.id] = message
			})
			return clonedState
		},
		addMessage: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.channel_id].messages[payload.id] = payload
			return clonedState
		}
	},
	effects: (dispatch) => ({
		fetchMessages({ channel_id, after, before }, onSuccess) {
			const formData = { channel_id, after, before }
			post('/channels/fetchMessages', formData).then((res) => {
				dispatch.channels.addMessages(res.payload)
				onSuccess()
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		},
		sendMessage(message) {
			dispatch.channels.addMessage({ ...message, validated: false })
			socket.emit('MESSAGE_CREATE', message)
		}
	})
}