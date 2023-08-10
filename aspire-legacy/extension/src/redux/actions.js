import { SET_SEARCH_INPUT } from './types'

export const setSearchInput = value => {
	return {
		type: SET_SEARCH_INPUT,
		payload: value
	}
}