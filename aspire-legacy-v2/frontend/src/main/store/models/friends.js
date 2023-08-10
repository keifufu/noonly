import post from 'main/axios/post'
import rfdc from 'rfdc'
const clone = rfdc()

export default {
	state: {},
	reducers: {
		set: (state, payload) => payload,
		add: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.id] = payload
			return clonedState
		},
		remove: (state, payload) => {
			const clonedState = clone(state)
			delete clonedState[payload.user_id]
			return clonedState
		}
	},
	effects: (dispatch) => ({
		addFriend: ({ username, onSuccess, onFail }) => {
			const formData = { username }
			post('/friends/add', formData).then((res) => {
				dispatch.friends.add(res.payload)
				dispatch.notifications.add(res.message)
				if (typeof onSuccess === 'function')
					onSuccess()
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
				if (typeof onFail === 'function')
					onFail()
			})
		},
		removeFriend: ({ user_id, onSuccess, onFail }) => {
			const formData = { user_id }
			post('/friends/remove', formData).then((res) => {
				dispatch.friends.remove(res.payload)
				dispatch.notifications.add(res.message)
				if (typeof onSuccess === 'function')
					onSuccess()
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
				if (typeof onFail === 'function')
					onFail()
			})
		}
	})
}