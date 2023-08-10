import {
	SET_INBOX_LOADING
} from './types'

const initialState = {
	loading: false
}

const reducer = (state = initialState, action) => {
	switch(action.type) {
		case SET_INBOX_LOADING: return {
			...state,
			loading: action.payload
		}
		default: return state
	}
}

export default reducer