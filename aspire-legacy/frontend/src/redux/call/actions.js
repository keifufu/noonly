import {
	SET_PEERS,
	SET_USER_VIDEO_AUDIO,
	SET_SCREEN_SHARE,
	SET_USER_STREAM,
	SET_SCREEN_TRACK
} from './types'

export const setPeers = value => ({
	type: SET_PEERS,
	payload: value
})

export const setUserVideoAudio = value => ({
	type: SET_USER_VIDEO_AUDIO,
	payload: value
})

export const setScreenShare = value => ({
	type: SET_SCREEN_SHARE,
	payload: value
})

export const setUserStream = value => ({
	type: SET_USER_STREAM,
	payload: value
})

export const setScreenTrack = value => ({
	type: SET_SCREEN_TRACK,
	payload: value
})