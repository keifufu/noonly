import {
	TOGGLE_SIDEBAR,
	TOGGLE_DARKMODE,
	SET_SEARCH_INPUT,
	ADD_METADATA
} from './types'

export const toggleDarkmode = () =>  ({
	type: TOGGLE_DARKMODE
})

export const toggleSidebar = () => ({
	type: TOGGLE_SIDEBAR
})

export const setSearchInput = value => ({
	type: SET_SEARCH_INPUT,
	payload: value
})

export const addMetadata = value => ({
	type: ADD_METADATA,
	payload: value
})