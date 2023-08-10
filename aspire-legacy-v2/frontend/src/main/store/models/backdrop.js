export default {
	state: {
		open: null,
		payload: null
	},
	reducers: {
		open: (state, payload) => ({
			open: payload.id,
			payload: payload.payload || null
		}),
		close: (state, payload) => ({
			/**
			 * Don't reset previous payload
			 * For Example: The Magnifier Backdrop will display an error image for a split second while fading out
			 */
			...state,
			open: null
		})
	}
}