import {
	SET_FRIEND,
	REMOVE_FRIEND
} from './types'

export const setFriend = value => ({
	type: SET_FRIEND,
	payload: value
})

export const removeFriend = value => ({
	type: REMOVE_FRIEND,
	payload: value
})