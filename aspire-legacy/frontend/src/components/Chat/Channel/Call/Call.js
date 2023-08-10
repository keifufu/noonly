import { CallEnd, DesktopAccessDisabled, DesktopWindows, Mic, MicOff, Videocam, VideocamOff, Call as MUICall } from '@material-ui/icons'
import { Avatar, fade, Grid, IconButton, Paper, Tooltip, withStyles } from '@material-ui/core'
import manager from '../../../../managers/voiceManager'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import VideoCard from './VideoCard'

class VideoV4 extends Component {
	constructor(props) {
		super(props)
		this.user = JSON.parse(localStorage.getItem('user'))
	}
	
	render() {
		const { toggleCamera, toggleMicrophone, toggleScreenshare, leaveRoom } = this
		const { classes, peers, userVideoAudio, screenShare, userStream, channel, friends } = this.props
		const isCameraOn = userVideoAudio.localUser.video
		const isMuted = !userVideoAudio.localUser.audio

		if(!channel.call || channel.call.length < 1) return null
		const inCallMyself = manager.isInCall()

		let anyHasVideo = false
		Object.values(userVideoAudio).forEach(({ video }) => { if(video) anyHasVideo = true })

		return (
			<Paper className={classes.root}>
				<Grid container justify='center' spacing={2}>
					{inCallMyself && (
						<Grid item key='user'>
							<VideoCard states={userVideoAudio.localUser} stream={this.screenshare ? this.screenshare : userStream} videoMode={anyHasVideo} />
						</Grid>
					)}
					{inCallMyself ? (
						peers.map((peer, index) => (
							<Grid item key={index}>
								<VideoCard states={userVideoAudio[peer.userName]} peer={peer.peer} videoMode={anyHasVideo} />
							</Grid>
						))
					) : (
						channel.call.map((id, index) => {
							if(id === this.user.id) return null
							const friend = friends[id]
							return (
								<Grid item key={index}>
									<Avatar src={friend.avatar} style={{ height: 100, width: 100 }} />
								</Grid>
							)
						})
					)}
				</Grid>
				{inCallMyself ? (
					<div className={classes.buttonBar}>
						<Tooltip title={isCameraOn && !screenShare ? 'Disable camera' : 'Enable camera'} placement='bottom' enterDelay={500}>
							<IconButton onClick={toggleCamera} className={classes.button}>
								{isCameraOn && !screenShare
								? <VideocamOff />
								: <Videocam />}
							</IconButton>
						</Tooltip>
						<Tooltip title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'} placement='bottom' enterDelay={500}>
							<IconButton onClick={toggleMicrophone} className={classes.button}>
								{isMuted
								? <MicOff />
								: <Mic />}
							</IconButton>
						</Tooltip>
						<Tooltip title={screenShare ? 'End Screenshare' : 'Start Screenshare'} placement='bottom' enterDelay={500}>
							<IconButton onClick={toggleScreenshare} className={classes.button}>
								{screenShare
								? <DesktopAccessDisabled />
								: <DesktopWindows />}
							</IconButton>
						</Tooltip>
						<Tooltip title='Leave Call' placement='bottom' enterDelay={500}>
							<IconButton onClick={leaveRoom} className={classes.button}>
								<CallEnd />
							</IconButton>
						</Tooltip>
					</div>
				) : (
					<Tooltip className={classes.joinButton} title='Join Call' placement='bottom' enterDelay={500}>
						<IconButton onClick={this.joinCall} className={classes.joinButtonButton}>
							<MUICall />
						</IconButton>
					</Tooltip>
				)}
			</Paper>
		)
	}

	joinCall = async () => {
		await manager.createStream()
		manager.joinRoom(this.props.channel.id)
	}

	toggleCamera = () => manager.toggleCamera()
	toggleMicrophone = () => manager.toggleMicrophone()
	toggleScreenshare = () => manager.shareScreen(this.setScreenshare)
	leaveRoom = () => manager.leaveRoom()

	setScreenshare = stream => {
		this.screenshare = stream
	}
}

const styles = theme => ({
	root: {
		backgroundColor: fade(theme.palette.common.black, 0.1),
		display: 'flex',
		flexDirection: 'column',
		marginBottom: theme.spacing(1),
		padding: theme.spacing(2),
		flexGrow: 1
	},
	buttonBar: {
		backgroundColor: fade(theme.palette.common.black, 0.1),
		borderRadius: theme.shape.borderRadius,
		alignSelf: 'center',
		padding: theme.spacing(1),
		width: 200,
		display: 'flex',
		justifyContent: 'space-between',
		marginTop: theme.spacing(2)
	},
	joinButton: {
		alignSelf: 'center',
		marginTop: theme.spacing(2)
	},
	joinButtonButton: {
		backgroundColor: fade('#00B200', 0.7),
		'&:hover': {
			backgroundColor: fade('#00B200', 0.5)
		}
	},
	button: {
		width: 42,
		height: 42
	}
})

const mapStateToProps = state => ({
	peers: state.call.peers,
	userVideoAudio: state.call.userVideoAudio,
	screenShare: state.call.screenShare,
	userStream: state.call.userStream,
	friends: state.friends
})
const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(VideoV4))