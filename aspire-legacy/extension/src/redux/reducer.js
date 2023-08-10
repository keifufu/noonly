import { SET_SEARCH_INPUT } from './types'

const initialState = {
	searchInput: ''
}

const reducer = (state = initialState, action) => {
	switch(action.type) {
		case SET_SEARCH_INPUT: return {
			...state,
			searchInput: action.payload.toLowerCase(),
		}
		default: return state
	}
}

export default reducer