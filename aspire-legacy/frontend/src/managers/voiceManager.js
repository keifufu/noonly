import { store, setPeers, setScreenShare, setScreenTrack, setUserStream, setUserVideoAudio, setChannel } from '../redux'
import handler from '../socket/handler'
import Peer from 'simple-peer'

const clone = require('rfdc')()
let user = JSON.parse(localStorage.getItem('user'))
if(user) {
	user.username = JSON.parse(localStorage.getItem('user')).username + Math.floor(Math.random() * 100)
}

const utils = {
	createPeer: (userId, caller, stream) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream
		})

		peer.on('signal', signal => {
			handler.emit('BE-call-user', {
				userToCall: userId,
				from: caller,
				signal
			})
		})
		peer.on('disconnect', () => peer.destroy())

		return peer
	},
	addPeer: (incomingSignal, callerId, stream) => {
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream
		})

		peer.on('signal', signal => {
			handler.emit('BE-accept-call', { signal, to: callerId })
		})
		peer.on('disconnect', () => peer.destroy())
		peer.signal(incomingSignal)

		return peer
	},
	findPeer: id => {
		/* Dont copy here, because we want to get the stream which cannot be copied */
		const state = store.getState()
		return state.call.peers.find(p => p.peerID === id)
	}
}

const handlers = {
	onUserJoin: ({ users }) => {
		const socketID = handler.getSocketID()
		/* Dont copy here, because we want to get the stream which cannot be copied */
		const state = store.getState()
		const peers = []

		users.forEach(({ userId, info }) => {
			const { userName, video, audio } = info
			if(userName !== user.username) {
				const peer = utils.createPeer(userId, socketID, state.call.userStream);
				peer.userName = userName
				peer.peerID = userId

				peers.push({
					peerID: userId,
					peer,
					userName
				})

				const userVideoAudio = { ...state.call.userVideoAudio, [peer.userName]: { video, audio } }
				store.dispatch(setUserVideoAudio(userVideoAudio))
			}
		})

		store.dispatch(setPeers(peers))
	},
	onReceiveCall: ({ signal, from, info }) => {
		const { userName, video, audio } = info
		/* Dont copy here, because we want to get the stream which cannot be copied */
		const state = store.getState()
		const peerIdx = utils.findPeer(from)

		if(!peerIdx) {
			const peer = utils.addPeer(signal, from, state.call.userStream)
			peer.userName = userName

			const peers = [...state.call.peers, {
				peerID: from,
				peer,
				userName
			}]
			store.dispatch(setPeers(peers))

			const userVideoAudio = { ...state.call.userVideoAudio, [peer.userName]: { video, audio } }
			store.dispatch(setUserVideoAudio(userVideoAudio))
		}
	},
	onCallAccepted: ({ signal, answerId }) => {
		const peerIdx = utils.findPeer(answerId)
		if(!peerIdx) return
		peerIdx.peer.signal(signal)
	},
	onUserLeave: ({ userId }) => {
		const peerIdx = utils.findPeer(userId)
		if(!peerIdx) return
		peerIdx.peer.destroy()
		const state = clone(store.getState())
		const peers = state.call.peers.filter(user => user.peerID !== peerIdx.peer.peerID)
		store.dispatch(setPeers(peers))
	},
	onToggleCamera: ({ userId, switchTarget }) => {
		const peerIdx = utils.findPeer(userId)
		if(!peerIdx) return
		const state = clone(store.getState())

		let video = state.call.userVideoAudio[peerIdx.userName].video
		let audio = state.call.userVideoAudio[peerIdx.userName].audio

		if(switchTarget === 'video') video = !video
		else audio = !audio
		const userVideoAudio = { ...state.call.userVideoAudio, [peerIdx.userName]: { video, audio } }
		store.dispatch(setUserVideoAudio(userVideoAudio))
	},
	/* ---------- */
	onVoiceJoin: id => {
		const { channels } = clone(store.getState())
		const channel = channels[channels.selected]
		if(!channel) return
		channel.call.push(id)
		store.dispatch(setChannel(channel))
	},
	onVoiceLeave: id => {
		const { channels } = clone(store.getState())
		const channel = channels[channels.selected]
		if(!channel) return
		channel.call = channel.call.filter(_id => _id !== id)
		store.dispatch(setChannel(channel))
	}
}

let currentRoom = null

const manager = {
	isInCall: () => currentRoom !== null,
	createStream: async () => {
		await handler.awaitSocket()
		return new Promise((resolve, reject) => {
			navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
				const videoTrack = stream.getVideoTracks()[0]
				videoTrack.enabled = false
				store.dispatch(setUserStream(stream))
				resolve(stream)
			}).catch(err => reject(err))
		})
	},
	listen: () => {
		handler.register('VOICE_JOIN', handlers.onVoiceJoin)
		handler.register('VOICE_LEAVE', handlers.onVoiceLeave)
	},
	stop: () => {
		handler.unregister('VOICE_JOIN', handlers.onVoiceJoin)
		handler.unregister('VOICE_LEAVE', handlers.onVoiceLeave)
	},
	joinRoom: (roomId) => {
		currentRoom = roomId
		handler.emit('BE-join-room', { roomId, userName: user.username })
		handler.register('FE-user-join', handlers.onUserJoin)
		handler.register('FE-receive-call', handlers.onReceiveCall)
		handler.register('FE-call-accepted', handlers.onCallAccepted)
		handler.register('FE-user-leave', handlers.onUserLeave)
		handler.register('FE-toggle-camera', handlers.onToggleCamera)
		/* Meh, this is a fix to get Call.js to update. Updating the state of the component doesnt work since this function is also called from Header */
		store.dispatch(setScreenShare(0))
	},
	leaveRoom: () => {
		if(!currentRoom) return
		currentRoom = null
		handler.emit('BE-leave-room')
		handler.unregister('FE-user-join', handlers.onUserJoin)
		handler.unregister('FE-receive-call', handlers.onReceiveCall)
		handler.unregister('FE-call-accepted', handlers.onCallAccepted)
		handler.unregister('FE-user-leave', handlers.onUserLeave)
		handler.unregister('FE-toggle-camera', handlers.onToggleCamera)
		/* Dont copy here, because we want to get the stream which cannot be copied */
		const state = store.getState()
		state.call.userStream.getTracks().forEach(track => track.stop())
		store.dispatch(setPeers([]))
		store.dispatch(setUserVideoAudio({ localUser: { video: false, audio: true } }))
		store.dispatch(setScreenShare(false))
		store.dispatch(setUserStream(null))
		store.dispatch(setScreenTrack(null))
	},
	toggleCamera: () => {
		/* Dont copy here, because we want to get the stream which cannot be copied */
		const state = store.getState()
		let videoSwitch = state.call.userVideoAudio['localUser'].video

		const stream = state.call.userStream
		const videoTrack = stream.getVideoTracks()[0]
		videoSwitch = !videoSwitch
		videoTrack.enabled = videoSwitch
		store.dispatch(setUserStream(stream))

		const userVideoAudio = { ...state.call.userVideoAudio, localUser: { ...state.call.userVideoAudio.localUser, video: videoSwitch } }
		store.dispatch(setUserVideoAudio(userVideoAudio))
		handler.emit('BE-toggle-camera-audio', { roomId: currentRoom, switchTarget: 'video' })
	},
	toggleMicrophone: () => {
		/* Dont copy here, because we want to get the stream which cannot be copied */
		const state = store.getState()
		let audioSwitch = state.call.userVideoAudio['localUser'].audio

		const stream = state.call.userStream
		const audioTrack = stream.getAudioTracks()[0]
		audioSwitch = !audioSwitch
		audioTrack.enabled = audioSwitch
		store.dispatch(setUserStream(stream))

		const userVideoAudio = { ...state.call.userVideoAudio, localUser: { ...state.call.userVideoAudio.localUser, audio: audioSwitch } }
		store.dispatch(setUserVideoAudio(userVideoAudio))
		handler.emit('BE-toggle-camera-audio', { roomId: currentRoom, switchTarget: 'audio' })
	},
	shareScreen: async (setStream) => {
		/* Dont copy here, because we want to get the stream which cannot be copied */
		const state = store.getState()
		if(!state.call.screenShare) {
			const stream = await navigator.mediaDevices.getDisplayMedia({ cursor: true })
			const screenTrack = stream.getTracks()[0]
			state.call.peers.forEach(({ peer }) => {
				peer.replaceTrack(
					peer.streams[0].getTracks().find(track => track.kind === 'video'),
					screenTrack,
					state.call.userStream
				)
			})

			screenTrack.onended = () => {
				screenTrack.stop()

				const userVideoAudio = { ...state.call.userVideoAudio, localUser: { ...state.call.userVideoAudio.localUser, video: false } }
				store.dispatch(setUserVideoAudio(userVideoAudio))
				handler.emit('BE-toggle-camera-audio', { roomId: currentRoom, switchTarget: 'video' })
				
				state.call.peers.forEach(({ peer }) => {
					peer.replaceTrack(
						screenTrack,
						peer.streams[0].getTracks().find(track => track.kind === 'video'),
						state.call.userStream
					)
				})

				setStream(null)
				store.dispatch(setScreenShare(false))
			}

			setStream(stream)
			if(!state.call.userVideoAudio.localUser.video) {
				const userVideoAudio = { ...state.call.userVideoAudio, localUser: { ...state.call.userVideoAudio.localUser, video: true } }
				store.dispatch(setUserVideoAudio(userVideoAudio))
				handler.emit('BE-toggle-camera-audio', { roomId: currentRoom, switchTarget: 'video' })
			}
			store.dispatch(setScreenTrack(screenTrack))
			store.dispatch(setScreenShare(true))
		} else {
			state.call.screenTrack.onended()
			store.dispatch(setScreenTrack(null))
		}
	}
}

export default manager