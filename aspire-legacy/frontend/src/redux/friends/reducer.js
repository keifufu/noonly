import {
	SET_FRIEND,
	REMOVE_FRIEND
} from './types'

const clone = require('rfdc')()
const initialState = {}

const reducer = (state = initialState, action) => {
	switch(action.type) {
		case SET_FRIEND: {
			const newState = clone(state)
			newState[action.payload.id] = action.payload
			return newState
		}
		case REMOVE_FRIEND: {
			let newState = clone(state)
			delete newState[action.payload.id]
			return newState
		}
		default: return state
	}
}

export default reducer