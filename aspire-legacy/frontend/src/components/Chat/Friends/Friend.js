import { Avatar, Card, fade, CardHeader, IconButton, withStyles, Tooltip } from '@material-ui/core'
import { Block, Cancel, ChatBubble, Check, MoreVert } from '@material-ui/icons'
import { setSelectedChannel } from '../../../redux'
import { withRouter } from 'react-router-dom'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Api from '../../../Api'

class Friend extends Component {
	render() {
		const { openChat, cancelRequest, acceptRequest, denyRequest } = this
		const { classes, data } = this.props
		const { friend, onContextMenu, openMenu } = data

		/* Temporary hard-coded status based on whether the user is online */
		friend.status = friend.isOnline ? 'Online' : (!friend.incoming && !friend.outgoing) && 'Offline'

		return (
			<Card onContextMenu={onContextMenu} className={classes.card}>
				<CardHeader
					classes={{ action: classes.action }}
					className={classes.header}
					avatar={<Avatar src={friend.avatar} className={classes.avatar} />}
					title={friend.username}
					subheader={friend.status}
					action={
						friend.incoming ? (<>
							<Tooltip title='Accept Friend Request' placement='top' enterDelay={500}>
								<IconButton onClick={() => acceptRequest(friend)} className={classes.button}>
									<Check className={classes.buttonIcon} />
								</IconButton>
							</Tooltip>
							<Tooltip title='Deny Friend Request' placement='top' enterDelay={500}>
								<IconButton onClick={() => denyRequest(friend)} className={classes.button}>
									<Block className={classes.buttonIcon} />
								</IconButton>
							</Tooltip>
						</>) : friend.outgoing ? (
							<Tooltip title='Abort Friend Request' placement='top' enterDelay={500}>
								<IconButton onClick={() => cancelRequest(friend)} className={classes.button}>
									<Cancel className={classes.buttonIcon} />
								</IconButton>
							</Tooltip>
						) : <>
						<Tooltip title={`Message ${friend.username}`} placement='top' enterDelay={500}>
							<IconButton onClick={() => openChat(friend)} className={classes.button}>
								<ChatBubble className={classes.buttonIcon} />
							</IconButton>
						</Tooltip>
						<IconButton onClick={openMenu} className={classes.button}>
							<MoreVert className={classes.buttonIcon} />
						</IconButton>
					</>}
				/>
			</Card>
		)
	}

	openChat = friend => {
		const { setSelectedChannel, history } = this.props
		history.push(`/chat/${friend.username}`)
		setSelectedChannel(friend.channel_id)
	}

	cancelRequest = friend => {
		const { enqueueSnackbar } = this.props
		Api.friends.requests.cancel(friend).then(res => {
			enqueueSnackbar(res, { variant: 'success' })
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
		})
	}

	acceptRequest = friend => {
		const { enqueueSnackbar } = this.props
		Api.friends.requests.accept(friend).then(res => {
			enqueueSnackbar(res, { variant: 'success' })
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
		})
	}

	denyRequest = friend => {
		const { enqueueSnackbar } = this.props
		Api.friends.requests.deny(friend).then(res => {
			enqueueSnackbar(res, { variant: 'success' })
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
		})
	}
}

const styles = theme => ({
	card: {
		'&:hover': {
			backgroundColor: fade(theme.palette.common.black, 0.1),
		}
	},
	header: {
		padding: theme.spacing(1)
	},
	avatar: {
		width: 38,
		height: 38
	},
	action: {
		display: 'flex',
		alignSelf: 'center',
		marginTop: 0,
		marginRight: theme.spacing(0.3)
	},
	button: {
		width: 38,
		height: 38
	},
	buttonIcon: {
		width: 22,
		height: 22
	}
})

const mapStateToProps = state => ({})
const mapDispatchToProps = dispatch => ({
	setSelectedChannel: value => dispatch(setSelectedChannel(value))
})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withRouter(withSnackbar(Friend))))