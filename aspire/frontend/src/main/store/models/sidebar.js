export default {
	state: false,
	reducers: {
		toggle: (state, payload) => !state,
		set: (state, payload) => {
			if (typeof payload !== 'boolean') return state
			return payload
		}
	}
}