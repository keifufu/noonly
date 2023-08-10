import {
	SET_CLOUD_LOADING,
	SET_CLOUD_TREE,
	RELOAD_CLOUD_TREE
} from './types'

export const setCloudLoading = value => ({
	type: SET_CLOUD_LOADING,
	payload: value
})

export const setCloudTree = value => ({
	type: SET_CLOUD_TREE,
	payload: value
})

export const reloadCloudTree = () => ({
	type: RELOAD_CLOUD_TREE
})