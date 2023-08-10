import { Card, withStyles, fade, Avatar, Badge } from '@material-ui/core'
import { MicOff } from '@material-ui/icons'
import React, { Component } from 'react'

class VideoCard extends Component {
	constructor(props) {
		super(props)
		this.videoRef = React.createRef()
		this.stream = null
	}

	render() {
		const { classes, states, videoMode } = this.props
		const { expandScreen } = this

		return (
			<Badge invisible={states?.audio} badgeContent={<MicOff className={classes.micIndicator} />} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} overlap='circle'>
				{!states?.video && !videoMode ? (<>
					<Avatar src={'bruh'} className={classes.avatar} />
					<video playsInline autoPlay muted={this.props.stream ? true : false} ref={this.videoRef} className={classes.hiddenVideo} />
				</>) : (
					<Card onClick={expandScreen} className={classes.card}>
						{states?.video ? (
							<div className={classes.cardVideo}>
								<video playsInline autoPlay muted={this.props.stream ? true : false} ref={this.videoRef} className={classes.video} />
							</div>
						) : (
							<div className={classes.cardAvatar}>
								<Avatar src={'bruh'} className={classes.bigAvatar} />
								<video playsInline autoPlay muted={this.props.stream ? true : false} ref={this.videoRef} className={classes.hiddenVideo} />
							</div>
						)}
					</Card>
				)}
			</Badge>
		)
	}

	componentDidMount = () => {
		if(this.props.stream) {
			this.stream = this.props.stream
		} else {
			if(!this.props.peer) return
			this.props.peer.on('stream', async stream => {
				this.stream = stream
			})
		}
		this.videoRef.current.srcObject = this.stream
	}

	componentDidUpdate = () => {
		if(this.props.stream && this.props.stream !== this.stream) this.stream = this.props.stream
		this.videoRef.current.srcObject = this.stream
	}

	expandScreen = e => {
		const elem = e.target
		if(elem.requestFullscreen) {
		  	elem.requestFullscreen()
		} else if (elem.mozRequestFullScreen) {
			/* Firefox */
			elem.mozRequestFullScreen()
		} else if (elem.webkitRequestFullscreen) {
			/* Chrome, Safari & Opera */
			elem.webkitRequestFullscreen()
		} else if (elem.msRequestFullscreen) {
			/* IE/Edge */
			elem.msRequestFullscreen()
		}
	}
}

const styles = theme => ({
	card: {
		maxHeight: 250,
		'&:hover': {
			cursor: 'pointer'
		},
		backgroundColor: fade(theme.palette.common.black, 0.1),
		borderRadius: theme.shape.borderRadius
	},
	avatar: {
		height: 100,
		width: 100
	},
	bigAvatar: {
		height: 150,
		width: 150
	},
	cardVideo: {
		padding: theme.spacing(1)
	},
	cardAvatar: {
		height: 250,
		width: 400,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	},
	video: {
		height: 250,
		width: 400,
		objectFit: 'contain'
	},
	micIndicator: {
		height: 34,
		width: 34
	},
	hiddenVideo: {
		visibility: 'hidden',
		height: 0,
		width: 0
	}
})

export default withStyles(styles, { withTheme: true })(VideoCard)