import {
	SET_CLOUD_LOADING,
	SET_CLOUD_TREE,
	RELOAD_CLOUD_TREE
} from './types'

const initialState = {
	loading: false,
	tree: null,
	reloadTree: false,
	cache: {}
}

const reducer = (state = initialState, action) => {
	switch(action.type) {
		case SET_CLOUD_LOADING: return {
			...state,
			loading: action.payload
		}
		case SET_CLOUD_TREE: return {
			...state,
			tree: action.payload
		}
		case RELOAD_CLOUD_TREE: return {
			...state,
			reloadTree: !state.reloadTree
		}
		default: return state
	}
}

export default reducer