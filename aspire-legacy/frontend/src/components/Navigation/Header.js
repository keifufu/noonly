import { AccountCircle, Brightness4, Brightness7, Call, ExitToApp, Menu as MenuIcon, PersonAdd, Search } from '@material-ui/icons'
import { AppBar, fade, InputBase, Toolbar, Typography, withStyles, withWidth } from '@material-ui/core'
import { toggleSidebar, toggleDarkmode, setSearchInput } from '../../redux'
import voiceManager from '../../managers/voiceManager'
import { withRouter } from 'react-router-dom'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import IconButton from '../IconButton'
import { connect } from 'react-redux'
import Menu from '../Menu'
import CreateGroupPopover from '../Chat/Channel/CreateGroupPopover'

class Header extends Component {
	constructor(props) {
		super(props)
		this.state = {
			cursors: {
				menu: { x: null, y: null },
				group: { x: null, y: null }
			}
		}
	}

	render() {
		const { classes, toggleSidebar, darkMode, searchInput, setSearchInput, toggleDarkmode, width } = this.props
		const { cursors } = this.state
		
		const pathname = document.location.pathname.split('/')[1]
		const titles = {
			'inbox': 'Inbox',
			'screenshots': 'Screenshots',
			'passwords': 'Passwords',
			'cloud': 'Cloud',
			'chat': 'Chat'
		}

		return (
			<div className={classes.root}>
				<AppBar color='inherit' className={classes.appbar}>
					<Toolbar>
						<IconButton tooltip='Open Sidebar' edge='start' onClick={toggleSidebar} icon={MenuIcon} />
						<Typography	variant='h6' className={classes.title}>
							{titles[pathname]}
						</Typography>
						<div className={classes.search}>
							<div className={classes.searchIcon}>
								<Search />
							</div>
							<InputBase placeholder='Search…' classes={{ root: classes.inputRoot, input: classes.inputInput }} value={searchInput} onChange={e => setSearchInput(e.target.value)} />
						</div>
						<div className={classes.buttons}>
							<IconButton tooltip='Add Friends to DM' onClick={this.onGroupClick} icon={PersonAdd} visible={pathname === 'chat'} />
							<IconButton tooltip='Start a Call' onClick={this.startCall} icon={Call} visible={pathname === 'chat'} />
							<IconButton tooltip='Toggle Theme' onClick={toggleDarkmode} icon={ darkMode ? Brightness7 : Brightness4 } visible={width !== 'xs'} />
							<IconButton onClick={this.onProfileClick} icon={AccountCircle} />
						</div>
					</Toolbar>
				</AppBar>
				<Menu
					cursors={cursors.menu}
					offset={{ x: -100, y: 0 }}
					onClose={() => this.setState({ cursors: { ...this.state.cursors, menu: { x: null, y: null } } })}
					items={[
						{ name: 'Profile', onClick: () => { console.log("clicky profile") }, icon: AccountCircle },
						{ name: 'Toggle Theme', onClick: toggleDarkmode, icon: darkMode ? Brightness7 : Brightness4, visible: width === 'xs' },
						{ name: 'Logout', onClick: this.logout, icon: ExitToApp }
					]}
				/>
				<CreateGroupPopover
					cursors={cursors.group}
					onClose={() => this.setState({ cursors: { ...this.state.cursors, group: { x: null, y: null } } })}
					offset={{ x: -350, y: 25 }}
				/>
			</div>
		)
	}
	

	logout = () => {
		this.props.enqueueSnackbar('You will be redirected', { variant: 'success', autoHideDuration: 1500 })
		localStorage.removeItem('user')
		setTimeout(() => { window.location.reload() }, 1500)
	}

	startCall = async () => {
		const { selected } = this.props.channels
		await voiceManager.createStream()
		voiceManager.joinRoom(selected)
	}

	onGroupClick = e => {
		e.preventDefault()
		this.setState({
			cursors: {
				...this.state.cursors,
				group: {
					x: e.clientX - 2,
					y: e.clientY - 4
				}
			}
		})
	}

	onProfileClick = e => {
		e.preventDefault()
		this.setState({
			cursors: {
				...this.state.cursors,
				menu: {
					x: e.clientX - 2,
					y: e.clientY - 4
				}
			}
		})
	}
}

const styles =  theme => ({
	spacer: {
		backgroundColor: theme.palette.background.default,
		minHeight: theme.spacing(1),
		position: 'fixed',
		width: '100%',
		zIndex: 1000,
		top: 0
	},
	appbar: {
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		[theme.breakpoints.down('xs')]: {
			width: `calc(100% - 15px)`,
			top: theme.spacing(1),
			margin: theme.spacing(0, 1, 1, 1),
			borderRadius: 10
		}
	},
	buttons: {
		display: 'flex'
	},
	menuButton: {
		[theme.breakpoints.up('sm')]: {
			marginLeft: -theme.spacing(2) - 3
		},
		marginRight: theme.spacing(2)
	},
	title: {
		flexGrow: 1,
		display: 'none',
		[theme.breakpoints.up('sm')]: {
			display: 'block'
		},
		userSelect: 'none'
	},
	search: {
		userSelect: 'none',
		position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25),
		},
		marginRight: theme.spacing(2),
		marginLeft: 0,
		[theme.breakpoints.up('sm')]: {
			marginLeft: theme.spacing(3),
			width: 'auto'
		}
	},
	searchIcon: {
		paddingLeft: theme.spacing(2),
		justifyContent: 'center',
		pointerEvents: 'none',
		position: 'absolute',
		alignItems: 'center',
		display: 'flex',
		height: '100%'
	},
	inputRoot: {
		color: 'inherit',
	},
	inputInput: {
		paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
		transition: theme.transitions.create('width'),
		padding: theme.spacing(1, 1, 1, 0),
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			width: '16ch',
			'&:focus': {
				width: '20ch',
			}
		}
	},
	menuIcon: {
		marginLeft: -theme.spacing(1),
		marginRight: theme.spacing(1)
	}
})

const mapStateToProps = state => ({
	darkMode: state.generic.darkMode,
	searchInput: state.generic.searchInput,
	channels: state.channels
})
const mapDispatchToProps = dispatch => ({
	toggleSidebar: () => dispatch(toggleSidebar()),
	toggleDarkmode: () => dispatch(toggleDarkmode()),
	setSearchInput: value => dispatch(setSearchInput(value))
})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(withRouter(withWidth()(Header)))))