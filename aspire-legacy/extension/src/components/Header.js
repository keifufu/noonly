import { AppBar, Button, Dialog, DialogActions, DialogTitle, fade, IconButton, InputBase, Toolbar, withStyles } from '@material-ui/core'
import { ExitToApp, Search } from '@material-ui/icons'
import { withRouter } from 'react-router-dom'
import { setSearchInput } from '../redux'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'
import { connect } from 'react-redux'

class Header extends Component {
	constructor(props) {
		super(props)
		this.state = {
			logoutConfirm: false
		}
	}

	render() {
		const { classes, searchInput, setSearchInput } = this.props
		const { logoutConfirm } = this.state
		const { logout, handleClose } = this

		return (
			<>
			<div className={classes.spacer}></div>
			<AppBar position='fixed' color='inherit' className={classes.appBar}>
				<Toolbar>
					<div className={classes.search}>
						<div className={classes.searchIcon}>
							<Search />
						</div>
						<InputBase
							autoFocus
							placeholder='Search…'
							classes={{
								root: classes.inputRoot,
								input: classes.inputInput,
							}}
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
						/>
					</div>
					<div className={classes.logout}>
						<IconButton onClick={() => this.setState({ logoutConfirm: true })} color='inherit'>
							<ExitToApp />
						</IconButton>
					</div>
				</Toolbar>
			</AppBar>
				<Dialog open={logoutConfirm} onClose={handleClose}>
				<DialogTitle>Are you sure?</DialogTitle>
				<DialogActions>
					<Button onClick={handleClose} color='primary'>Cancel</Button>
					<Button type='submit' onClick={logout} color='primary'>Confirm</Button>
				</DialogActions>
			</Dialog>
			</>
		)
	}

	logout = () => {
		this.setState({ logoutConfirm: false })
		this.props.enqueueSnackbar('You will be redirected', { variant: 'success', autoHideDuration: 1500 })
		localStorage.removeItem('user')
		setTimeout(() => { this.props.setState({ loggedIn: false }) }, 1500)
	}

	handleClose = () => this.setState({ logoutConfirm: false })
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
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		[theme.breakpoints.down('xs')]: {
			width: `calc(100% - 15px)`,
			top: theme.spacing(1),
			margin: theme.spacing(0, 1, 1, 1),
			borderRadius: theme.shape.borderRadius
		}
	},
	search: {
		userSelect: 'none',
		position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25),
		},
		marginLeft: 0,
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			marginLeft: theme.spacing(3),
			width: 'auto',
		}
	},
	searchIcon: {
		paddingLeft: theme.spacing(1),
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
		padding: theme.spacing(1, 1, 1, 0),
		paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
		transition: theme.transitions.create('width'),
		minWidth: `calc(100% + 50px)`,
		[theme.breakpoints.up('md')]: {
			width: '20ch'
		}
	},
	logout: {
		marginRight: -10,
		marginLeft: 3
	}
})

const mapStateToProps = state => { return { searchInput: state.searchInput } }
const mapDispatchToProps = dispatch => { return {
	setSearchInput: value => dispatch(setSearchInput(value))
}}
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(withRouter(Header))))