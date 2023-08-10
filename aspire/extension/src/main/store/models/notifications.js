import randomToken from 'library/utilities/randomToken'

const timeouts = {}

export default {
	state: [],
	reducers: {
		_add: (state, payload) => [...state, payload],
		_update: (state, payload) => state.map((e) => (e.id === payload.id ? payload : e)),
		_remove: (state, payload) => state.filter((e) => e.id !== payload)
	},
	effects: (dispatch) => ({
		add: (payload, rootState) => {
			const notification = {
				title: null,
				text: payload,
				button: null,
				onClick: () => null,
				severity: 'success',
				id: randomToken(7),
				...payload
			}

			if (rootState.notifications.find((e) => e.id === notification.id))
				dispatch.notifications._update(notification)
			else
				dispatch.notifications._add(notification)

			clearTimeout(timeouts[notification.id])
			timeouts[notification.id] = setTimeout(() => {
				dispatch.notifications._remove(notification.id)
			}, payload.time || 3000)
		},
		pauseTimeout: (payload) => clearTimeout(timeouts[payload.id]),
		continueTimeout: (payload) => {
			timeouts[payload.id] = setTimeout(() => {
				dispatch.notifications._remove(payload.id)
			}, payload.time || 3000)
		}
	})
}