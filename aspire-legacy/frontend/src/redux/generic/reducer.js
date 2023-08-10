import { setCookie, getCookie } from '../../Utilities'
import {
	TOGGLE_SIDEBAR,
	TOGGLE_DARKMODE,
	SET_SEARCH_INPUT,
	ADD_METADATA
} from './types'

const clone = require('rfdc')()
const darkMode = getCookie('darkMode') ? getCookie('darkMode') === 'true' ? true : false : true
const initialState = {
	sidebarOpen: false,
	darkMode: darkMode,
	searchInput: '',
	metadata: {}
}

const reducer = (state = initialState, action) => {
	switch(action.type) {
		case TOGGLE_SIDEBAR: return {
			...state,
			sidebarOpen: !state.sidebarOpen
		}
		case TOGGLE_DARKMODE:
		setCookie('darkMode', !state.darkMode, 999999)
		return {
			...state,
			darkMode: !state.darkMode
		}
		case SET_SEARCH_INPUT: return {
			...state,
			searchInput: action.payload
		}
		case ADD_METADATA: {
			const newState = clone(state)
			newState.metadata[action.payload.url] = action.payload
			return newState
		}
		default: return state
	}
}

export default reducer