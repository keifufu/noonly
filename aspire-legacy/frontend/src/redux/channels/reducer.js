import {
	SET_SELECTED_CHANNEL,
	SET_CHANNEL
} from './types'

const clone = require('rfdc')()
const initialState = {
	selected: null,
	cache: {}
}

const reducer = (state = initialState, action) => {
	switch(action.type) {
		case SET_SELECTED_CHANNEL: return {
			...state,
			selected: action.payload
		}
		case SET_CHANNEL: {
			const newState = clone(state)
			newState[action.payload.id] = action.payload
			return newState
		}
		default: return state
	}
}

export default reducer