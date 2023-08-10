import {
	SET_INBOX_LOADING
} from './types'

export const setInboxLoading = value => ({
	type: SET_INBOX_LOADING,
	payload: value
})