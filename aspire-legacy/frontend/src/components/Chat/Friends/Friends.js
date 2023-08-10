import { Block, Call, ChatBubble, Check, Person, RemoveCircle } from '@material-ui/icons'
import { Button, Grid, Paper, Tab, Tabs, withStyles } from '@material-ui/core'
import { setSelectedChannel } from '../../../redux'
import FriendAddDialog from './FriendAddDialog'
import { withRouter } from 'react-router-dom'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Dialog from '../../Dialog'
import Api from '../../../Api'
import Friend from './Friend'
import Menu from '../../Menu'

class Friends extends Component {
	constructor(props) {
		super(props)
		this.state = {
			blocked: [],
			value: 0,
			addDialog: false,
			removeDialog: false,
			cursors: { x: null, y: null },
			offset: { x: 0, y: 0 }
		}
	}
	
	render() {
		const { value, blocked, addDialog, removeDialog, cursors, offset, lastItem } = this.state
		const { handleChange, openMenu, handleClick } = this
		const { classes, friends: _friends } = this.props

		const friends = Object.values(_friends).filter(friend => {
			/* 0 = Online; 1 = All; 2 = Pending; 3 = Blocked */
			if(value === 0) {
				if(friend.isOnline) return true
			} else if(value === 1) {
				if(friend.incoming || friend.outgoing) return false
				return true
			} else if(value === 2) {
				// if(friend.isPending) return true
				if(friend.incoming || friend.outgoing) return true
			} else if(value === 3) {
				if(blocked.find(e => e.id === friend.id)) return true
			}
			return false
		})

		const pending = Object.values(_friends).filter(friend => {
			if(friend.incoming || friend.outgoing) return true
			return false
		})

		return (
			<div className={classes.root}>
				<Paper className={classes.toolbar}>
					<Tabs indicatorColor='primary' value={value} onChange={handleChange}>
						<Tab label='Online' />
						<Tab label='All' />
						<Tab label={`Pending ${pending.length > 0 ? `(${pending.length})` : ''}`} />
						<Tab label='Blocked' />
					</Tabs>
					<Button onClick={() => this.setState({ addDialog: true })} color='primary' variant='contained'>Add Friend</Button>
				</Paper>
				<Grid container spacing={1} className={classes.gridContainer}>
					{friends.map((friend, i) => (
						<Grid item xs={12} key={i}>
							<Friend data={{ friend, onContextMenu: e => handleClick(e, friend), openMenu: e => openMenu(e, friend) }} />
						</Grid>
					))}
				</Grid>
				<FriendAddDialog open={addDialog} onClose={() => this.setState({ addDialog: false })} />
				<Dialog
					title='Are you sure?'
					text={`Do you want to remove ${this.state.lastItem?.username} as a Friend?`}
					open={removeDialog}
					onSubmit={() => this.removeFriend(this.state.lastItem)}
					onClose={() => this.setState({ removeDialog: false })}
				/>
				<Menu
					cursors={cursors}
					offset={offset}
					onClose={() => this.setState({ cursors: { y: null, x: null } })}
					items={[
						{ name: 'Profile', icon: Person, onClick: () => {} },
						{ name: 'Message', icon: ChatBubble, onClick: () => this.openChat(lastItem), visible: Boolean(!lastItem?.incoming && !lastItem?.outgoing) },
						{ name: 'Call', icon: Call, onClick: () => {}, visible: Boolean(!lastItem?.incoming && !lastItem?.outgoing)  },
						{ name: 'Remove Friend', icon: RemoveCircle, onClick: () => this.setState({ removeDialog: true }), visible: Boolean(!lastItem?.incoming && !lastItem?.outgoing)  },
						{ name: 'Block', icon: Block, onClick: () => {}, visible: Boolean(!lastItem?.incoming && !lastItem?.outgoing)  },
						{ name: 'Cancel Request', icon: Block, onClick: () => this.cancelRequest(lastItem), visible: Boolean(lastItem?.outgoing) },
						{ name: 'Accept Friend', icon: Check, onClick: () => this.acceptRequest(lastItem), visible: Boolean(lastItem?.incoming) },
						{ name: 'Deny Friend', icon: Block, onClick: () => this.denyRequest(lastItem), visible: Boolean(lastItem?.incoming) },
					]}
				/>
			</div>
		)
	}

	componentDidMount = () => document.title = 'Friends - Aspire'

	openChat = friend => {
		const { setSelectedChannel, history } = this.props
		history.push(`/chat/${friend.username}`)
		setSelectedChannel(friend.channel_id)
	}

	removeFriend = user => {
		const { enqueueSnackbar } = this.props
		Api.friends.remove(user).then(res => {
			enqueueSnackbar(res, { variant: 'success' })
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
		})
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

	/* Open Context Menu */
	openMenu = (e, item) => {
		this.setState({
			cursors: { x: e.clientX - 2, y: e.clientY - 4 },
			offset: { x: -150, y: 0 },
			lastItem: item
		})
	}

	/* Handle Right Click on Grid Item */
	handleClick = (e, item) => {
		e.preventDefault()
		this.setState({
			cursors: { x: e.clientX - 2, y: e.clientY - 4 },
			offset: { x: 0, y: 0 },
			lastItem: item
		})
	}

	handleChange = (e, value) => this.setState({ value })
}

const styles = theme => ({
	root: {
		height: '100vh',
		width: '100%',
		flexGrow: 1
	},
	gridContainer: {
		maxHeight: '100vh',
		overflow: 'scroll'
	},
	toolbar: {
		marginBottom: theme.spacing(1),
		paddingLeft: theme.spacing(1),
		alignItems: 'center',
		display: 'flex',
		height: 48
	},
	menuIcon: {
		marginLeft: -theme.spacing(1),
		marginRight: theme.spacing(1),
		pointerEvents: 'none'
	}
})

const mapStateToProps = state => ({ friends: state.friends })
const mapDispatchToProps = dispatch => ({
	setSelectedChannel: value => dispatch(setSelectedChannel(value))
})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(withRouter(Friends))))