import rfdc from 'rfdc'
const clone = rfdc()

export default {
	state: {
		mail: false,
		screenshots: false,
		passwords: false,
		cloud: false,
		chat: false
	},
	reducers: {
		set: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.name] = payload.value
			return clonedState
		}
	}
}