export default {
	state: {
		open: null,
		cursors: { x: null, y: null },
		offset: { x: null, y: null },
		item: null
	},
	reducers: {
		open: (state, payload) => ({
			offset: { x: null, y: null },
			item: null,
			...payload,
			open: payload.id,
			cursors: payload.cursors ? {
				x: payload.cursors.x - 2,
				y: payload.cursors.y - 4
			} : null
		}),
		close: (state, payload) => ({
			open: null,
			cursors: { x: null, y: null },
			offset: { x: null, y: null },
			anchor: null,
			item: null
		}),
		setCursors: (state, payload) => ({
			...state,
			cursors: payload
		})
	}
}