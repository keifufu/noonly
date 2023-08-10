import { Divider, Drawer, Hidden, List, ListItem, makeStyles, SwipeableDrawer, Typography } from '@material-ui/core'
import { ArrowBack, Chat, Cloud, ImageRounded, Inbox, Lock, People } from '@material-ui/icons'
import { useHistory, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import clsx from 'clsx'

import SidebarItem from 'library/components/SidebarItem'
import storage from 'library/utilities/storage'

const defaultItems = [{
	id: 0,
	text: 'Inbox',
	icon: Inbox,
	key: 'mail',
	location: '/inbox',
	hasContent: false
}, {
	id: 1,
	text: 'Screenshots',
	icon: ImageRounded,
	key: 'screenshots',
	location: '/screenshots',
	hasContent: false
}, {
	id: 2,
	text: 'Accounts',
	icon: Lock,
	key: 'accounts',
	location: '/accounts',
	hasContent: false
}, {
	id: 3,
	text: 'Cloud',
	icon: Cloud,
	key: 'cloud',
	location: '/cloud',
	hasContent: false
}, {
	id: 4,
	text: 'Chat',
	icon: Chat,
	key: 'chat',
	location: '/chat',
	hasContent: true
}]

const useStyles = makeStyles((theme) => ({
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
	spacer: {
		...theme.mixins.toolbar
	},
	list: {
		marginBottom: theme.spacing(1),
		width: 300
	},
	title: {
		flexGrow: 1
	}
}))

function Sidebar({ sidebar, channels, toggleSidebar, setSearchInput }) {
	const classes = useStyles()
	const history = useHistory()
	const location = useLocation()
	const [displayContent, setDisplayContent] = useState(null)

	useEffect(() => {
		if (location.pathname.includes('/chat'))
			setDisplayContent('Chat')
	}, [location])

	const mapContent = (mobile) => {
		let items = defaultItems
		if (displayContent !== null)
			items = mapItems(displayContent, channels, setDisplayContent, history)

		return items.map((item) => (
			<SidebarItem
				{...item}
				sidebarOpen={sidebar}
				onClick={() => {
					if (item.onClick) {
						item.onClick()
					} else {
						if (!location.pathname.includes(item.location))
							history.push(item.location)
						setSearchInput('')
						if (mobile)
							toggleSidebar()
						if (item.hasContent) {
							setDisplayContent(item.text)
							if (!sidebar)
								toggleSidebar()
						}
					}
				}}
				key={item.id}
			/>
		))
	}

	return (<>
		<Hidden xsDown>
			<Drawer
				variant='permanent'
				className={
					clsx(classes.drawer, {
						[classes.drawerOpen]: sidebar,
						[classes.drawerClose]: !sidebar
					})
				}
				classes={{
					paper: clsx({
						[classes.drawerOpen]: sidebar,
						[classes.drawerClose]: !sidebar
					})
				}}>
				<div className={classes.spacer}/>
				<List>
					{mapContent()}
				</List>
			</Drawer>
		</Hidden>
		<Hidden smUp>
			<SwipeableDrawer
				variant='temporary'
				ModalProps={{ keepMounted: true }}
				open={sidebar}
				onOpen={toggleSidebar}
				onClose={toggleSidebar}
				className={classes.drawer}
			>
				<List>
					<ListItem className={classes.list}>
						<Typography variant='h6' className={classes.title}>
							{process.env.REACT_APP_HOSTNAME}
						</Typography>
					</ListItem>
					<Divider />
					{mapContent(true)}
				</List>
			</SwipeableDrawer>
		</Hidden>
	</>)
}

function mapItems(text, channels, setDisplayContent, history) {
	let items = []
	if (text === 'Chat') {
		items = Object.values(channels).map((e) => {
			const channel = {
				id: e.id,
				text: e.text,
				iconURL: `https://${process.env.REACT_APP_HOSTNAME}/userContent/channelIcons/${e.id}`,
				location: `/chat/${e.id}`
			}
			const { user } = storage
			if (e.type === 'DM') {
				const [friend] = e.participants.filter((e) => e.id !== user.id)
				channel.text = friend.username
				channel.iconURL = `https://${process.env.REACT_APP_HOSTNAME}/userContent/avatars/${friend.id}`
			}

			return channel
		})

		items.unshift({
			id: 'Friends',
			text: 'Friends',
			icon: People,
			onClick: () => history.push('/chat'),
			isSelected: (pathname) => ['/chat', '/chat/'].includes(pathname)
		})
	}
	items.push({
		id: 'Back',
		text: 'Back',
		icon: ArrowBack,
		onClick: () => setDisplayContent(null)
	})
	return items
}

const mapState = (state) => ({
	sidebar: state.sidebar,
	channels: state.channels
})
const mapDispatch = (dispatch) => ({
	toggleSidebar: dispatch.sidebar.toggle,
	setSearchInput: dispatch.searchInput.set
})
export default connect(mapState, mapDispatch)(Sidebar)