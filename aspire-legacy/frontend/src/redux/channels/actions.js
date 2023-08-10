import {
	SET_SELECTED_CHANNEL,
	SET_CHANNEL
} from './types'

export const setSelectedChannel = value => ({
	type: SET_SELECTED_CHANNEL,
	payload: value
})

export const setChannel = value => ({
	type: SET_CHANNEL,
	payload: value
})