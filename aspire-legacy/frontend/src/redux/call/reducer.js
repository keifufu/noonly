import {
	SET_PEERS,
	SET_USER_VIDEO_AUDIO,
	SET_SCREEN_SHARE,
	SET_USER_STREAM,
	SET_SCREEN_TRACK
} from './types'

const initialState = {
	peers: [],
	userVideoAudio: {
		localUser: { video: false, audio: true }
	},
	screenShare: false,
	userStream: null,
	screenTrack: null
}

const reducer = (state = initialState, action) => {
	switch(action.type) {
		case SET_PEERS: return {
			...state,
			peers: action.payload
		}
		case SET_USER_VIDEO_AUDIO: return {
			...state,
			userVideoAudio: action.payload
		}
		case SET_SCREEN_SHARE: return {
			...state,
			screenShare: action.payload
		}
		case SET_USER_STREAM: return {
			...state,
			userStream: action.payload
		}
		case SET_SCREEN_TRACK: return {
			...state,
			screenTrack: action.payload
		}
		default: return state
	}
}

export default reducer