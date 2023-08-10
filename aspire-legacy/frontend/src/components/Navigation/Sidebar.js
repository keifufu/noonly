import { Avatar, Badge, Divider, Drawer, Hidden, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, SwipeableDrawer, Typography, withStyles } from '@material-ui/core'
import { Inbox, ImageRounded, Cloud, Lock, Chat, ArrowBack, People } from '@material-ui/icons'
import { setSelectedChannel, toggleSidebar } from '../../redux'
import { withRouter } from 'react-router-dom'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import clsx from 'clsx'

class Sidebar extends Component {
	constructor(props) {
		super(props)
	
		this.state = {
			content: null
		}

		this.sidebarItems = [
			{
				id: 0,
				text: 'Inbox',
				icon: <Inbox />,
				location: '/inbox',
				hasContent: false
			}, {
				id: 1,
				text: 'Screenshots',
				icon: <ImageRounded />,
				location: '/screenshots',
				hasContent: false
			}, {
				id: 2,
				text: 'Passwords',
				icon: <Lock />,
				location: '/passwords',
				hasContent: false
			}, {
				id: 3,
				text: 'Cloud',
				icon: <Cloud />,
				location: '/cloud',
				hasContent: false
			}, {
				id: 4,
				text: 'Chat',
				icon: <Chat />,
				location: '/chat',
				hasContent: true
			}
		]
	}
	
	render() {
		const { classes, sidebarOpen, toggleSidebar, history, selectedChannel, setSelectedChannel, friends: _friends } = this.props
		const { handleClick, handleFriendClick, sidebarItems } = this
		const { content } = this.state

		const friends = Object.values(_friends).sort((a, b) => a.lastMessage - b.lastMessage).filter(friend => {
			if(friend.outgoing || friend.incoming) return false
			return true
		})

		let sidebarContent = null
		if(content === null) {
			sidebarContent = (
				sidebarItems.map(item =>
					<ListItem button key={item.text} onClick={() => handleClick(item)} selected={document.location.pathname.startsWith(item.location)}>
						<ListItemIcon>
							<Badge color='primary' badgeContent='1' invisible={item.location !== '/chat'}>
								{item.icon}
							</Badge>
						</ListItemIcon>
						<ListItemText primary={item.text}/>
					</ListItem>
				)
			)
		} else if(content === 4) {
			sidebarContent = (<>
				<ListItem selected={selectedChannel === null} button onClick={() => { this.props.history.push('/chat'); setSelectedChannel(null)}}>
					<ListItemIcon>
						<People />
					</ListItemIcon>
					<ListItemText primary='Friends' />
				</ListItem>
				<Divider style={{ marginTop: 5, marginBottom: 5 }} />
				{
					friends.map(friend => 
						<ListItem selected={selectedChannel === friend.channel_id} button onClick={() => handleFriendClick(friend)} key={friend.id}>
							<ListItemAvatar>
								<Avatar style={{ marginLeft: -8 }} src={friend.avatar} />
							</ListItemAvatar>
							<ListItemText classes={{ multiline: classes.multiline }} primary={friend.username} secondary={friend.isOnline && 'Online'} />
						</ListItem>
					)
				}
				{friends.length === 0 && <Typography className={classes.noFriends}>You don't have any Friends</Typography>}
				<ListItem button onClick={() => this.setState({ content: null })}>
					<ListItemIcon>
						<ArrowBack />
					</ListItemIcon>
				</ListItem>
			</>)
		}

		return (<>
			<Hidden smUp>
				<SwipeableDrawer variant='temporary' ModalProps={{ keepMounted: true }} open={sidebarOpen} onClose={toggleSidebar} onOpen={toggleSidebar} className={classes.drawer}>
					<List>
						<ListItem className={classes.list}>
							<Typography variant='h6' className={classes.title}>Aspire.icu</Typography>
						</ListItem>
						<Divider />
						{sidebarItems.map(item => {
							const onClick = () => { toggleSidebar(); history.push(item.location) }
							return (
								<ListItem button key={item.text} onClick={onClick} selected={document.location.pathname.startsWith(item.location)}>
									<ListItemIcon>{item.icon}</ListItemIcon>
									<ListItemText primary={item.text}/>
								</ListItem>
							)
						})}
					</List>
				</SwipeableDrawer>
			</Hidden>
			<Hidden xsDown>
				<Drawer variant='permanent' className={clsx(classes.drawer, { [classes.drawerOpen]: sidebarOpen, [classes.drawerClose]: !sidebarOpen })} classes={{ paper: clsx({ [classes.drawerOpen]: sidebarOpen, [classes.drawerClose]: !sidebarOpen }) }}>
					<div className={classes.spacer}/>
					<List>
						{sidebarContent}
					</List>
				</Drawer>
			</Hidden>
		</>)
	}

	componentDidMount = () => {
		const pathname = document.location.pathname
		this.sidebarItems.forEach(item => {
			if(pathname.startsWith(item.location)) {
				if(item.hasContent) {
					this.setState({ content: item.id })
					if(!this.props.sidebarOpen) {
						this.props.toggleSidebar()
					}
				}
			}
		})
	}

	componentDidUpdate = () => {
		const { friends, selectedChannel, setSelectedChannel } = this.props
		const pathname = document.location.pathname
		if(pathname.startsWith('/chat')) {
			let username = pathname.replace('/chat', '')
			if(username.startsWith('/')) username = username.slice(1)
			if(!username || username.length === 0) return
			const selected = Object.values(friends).find(e => e.username === username)
			if(selectedChannel === selected?.channel_id) return
			if(selected) setSelectedChannel(selected.channel_id)
		}
	}

	handleClick = item => {
		const { history, sidebarOpen, toggleSidebar } = this.props
		history.push(item.location)
		if(!item.hasContent) return
		this.setState({
			content: item.id
		})
		if(!sidebarOpen) toggleSidebar()
	}

	handleFriendClick = friend => {
		const { history, setSelectedChannel } = this.props
		history.push(`/chat/${friend.username}`)
		setSelectedChannel(friend.channel_id)
	}
}

const styles = theme => ({
	spacer: {
		...theme.mixins.toolbar
	},
	drawer: {
		whiteSpace: 'nowrap',
		flexShrink: 0,
		width: 220
	},
	drawerOpen: {
		width: 220,
		transition: theme.transitions.create('width', {
			duration: theme.transitions.duration.enteringScreen,
			easing: theme.transitions.easing.sharp
		})
	},
	drawerClose: {
		width: theme.spacing(7),
		overflowX: 'hidden',
		transition: theme.transitions.create('width', {
			duration: theme.transitions.duration.leavingScreen,
			easing: theme.transitions.easing.sharp
		})
	},
	menuButton: {
		marginLeft: 5
	},
	title: {
		flexGrow: 1
	},
	list: {
		marginBottom: theme.spacing(1),
		width: 300
	},
	multiline: {
		marginTop: 0,
		marginBottom: 0
	},
	noFriends: {
		textAlign: 'center'
	}
})

const mapStateToProps = state => ({
	sidebarOpen: state.generic.sidebarOpen,
	selectedChannel: state.channels.selected,
	friends: state.friends
})
const mapDispatchToProps = dispatch => ({
	toggleSidebar: () => dispatch(toggleSidebar()),
	setSelectedChannel: id => dispatch(setSelectedChannel(id))
})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withRouter(Sidebar)))