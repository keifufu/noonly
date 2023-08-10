import { BottomNavigation, BottomNavigationAction, Grid, Hidden, Menu, MenuItem, Paper, Tab, Tabs, withStyles } from '@material-ui/core'
import { Delete, GetApp, Publish } from '@material-ui/icons'
import PasswordCreateDialog from './PasswordCreateDialog'
import PasswordDeleteDialog from './PasswordDeleteDialog'
import PasswordEditDialog from './PasswordEditDialog'
import PasswordIconDialog from './PasswordIconDialog'
import PasswordNoteDialog from './PasswordNoteDialog'
import PasswordCard from './PasswordCard'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import PasswordFab from './PasswordFab'
import { decrypt } from '../Utilities'
import { connect } from 'react-redux'
import LazyLoad from 'react-lazyload'
import copy from 'clipboard-copy'
import Api from '../Api'

class Passwords extends Component {
	constructor(props) {
		super(props)
		this.state = {
			passwords: [],
			anchorEl: null,
			cursorX: null,
			cursorY: null,
			tabValue: 0,
			createDialog: false,
			deleteDialog: false,
			editDialog: false,
			iconDialog: false,
			noteDialog: false
		}
	}

	render() {
		const { passwords, anchorEl, cursorX, cursorY, tabValue, createDialog, editDialog, deleteDialog, iconDialog, noteDialog } = this.state
		const { fetchPasswords, openMenu, handleClick, handleClose, handleChange } = this
		const { classes, searchInput } = this.props

		let filteredPasswords = passwords.filter(e => { if (searchInput.length === 0 || e.site.toLowerCase().includes(searchInput) || e.username.toLowerCase().includes(searchInput) || e.email.toLowerCase().includes(searchInput)) return true; else return false })
		filteredPasswords = filteredPasswords.map(e => { return { ...e, site: e.site.toLowerCase() } })
		filteredPasswords = filteredPasswords.filter(e => tabValue === 2 ? e.trash === 'true' : e.trash !== 'true')
		filteredPasswords = filteredPasswords.sort((a, b) => a.site < b.site ? -1 : a.site > b.site ? 1 : 0)
		filteredPasswords = filteredPasswords.sort((a, b) => tabValue === 1 ? a.site > b.site ? -1 : a.site < b.site ? 1 : 0 : 1)

		const menuContent = ( <div>
			<MenuItem value='Edit' onClick={handleClose}>Edit</MenuItem>
			<MenuItem value='Edit Note' onClick={handleClose}>Edit Note</MenuItem>
			<MenuItem value='Copy Password' onClick={handleClose}>Copy Password</MenuItem>
			{
				tabValue === 2 ? (
					<> <MenuItem value='Restore' onClick={handleClose}>Restore</MenuItem>
					<MenuItem value='Delete' onClick={handleClose}>Delete</MenuItem> </>
				) :
				<MenuItem value='Move to Trash' onClick={handleClose}>Move to Trash</MenuItem>
			}
		</div> )

		return (<>
			<div className={classes.root} onContextMenu={e => e.preventDefault()} onMouseDownCapture={e => { if(e.button === 2) handleClose() }}>
				<div className={classes.spacer} id='back-to-top-anchor'/>
				<Hidden xsDown>
					<Paper className={classes.paper}>
						<Tabs value={tabValue} onChange={handleChange} indicatorColor='primary' textColor='primary' centered>
							<Tab label='A-Z'/>
							<Tab label='Z-A'/>
							<Tab label='Trash'/>
						</Tabs>
					</Paper>
				</Hidden>
				<Grid container className={classes.gridContainer} spacing={2}>
					{filteredPasswords.map(password =>
						<Grid item xs={12} key={password.id}>
							<LazyLoad>
								<PasswordCard password={password} openMenu={openMenu} onContextMenu={e => handleClick(password, e)} openIconDialog={password => this.setState({ iconDialog: true, iconDialogePassword: password })} />
							</LazyLoad>
						</Grid>
					)}
				</Grid>
				<PasswordFab onClick={() => this.setState({ createDialog: true })} />
				<PasswordCreateDialog open={createDialog} fetchPasswords={fetchPasswords} onClose={() => this.setState({ createDialog: false })} />
				<PasswordEditDialog open={editDialog} fetchPasswords={fetchPasswords} values={this.lastPassword} onClose={() => this.setState({ editDialog: false })} />
				<PasswordNoteDialog open={noteDialog} fetchPasswords={fetchPasswords} values={this.lastPassword} onClose={() => this.setState({ noteDialog: false })} />
				<PasswordDeleteDialog open={deleteDialog} fetchPasswords={fetchPasswords} password={this.lastPassword} onClose={() => this.setState({ deleteDialog: false })} />
				<PasswordIconDialog open={iconDialog} fetchPasswords={fetchPasswords} password={this.state.iconDialogePassword || {}} onClose={() => this.setState({ iconDialog: false })} />
				<Menu anchorReference='anchorPosition' anchorPosition={cursorX !== null && cursorY !== null ? { top: cursorY, left: cursorX } : undefined} keepMounted open={cursorY !== null} onClose={handleClose}>{menuContent}</Menu>
				<Menu anchorEl={anchorEl} transformOrigin={{ horizontal: 110, vertical: -65 }} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>{menuContent}</Menu>
			</div>
			<Hidden smUp>
				<BottomNavigation value={tabValue} onChange={handleChange} showLabels className={classes.stickToBottom}>
					<BottomNavigationAction label='A-Z' icon={<GetApp />}/>
					<BottomNavigationAction label='Z-A' icon={<Publish />}/>
					<BottomNavigationAction label='Trash' icon={<Delete />}/>
				</BottomNavigation>
			</Hidden>
		</>)
	}

	componentDidMount = () => this.fetchPasswords()

	fetchPasswords = () => {
		const localPasswords = localStorage.getItem('passwords')
		if(localPasswords) this.setState({ passwords: JSON.parse(localPasswords) })
		Api.passwords.fetch().then(res => {
			this.setState({ passwords: res })
			localStorage.setItem('passwords', JSON.stringify(res))
		}).catch(err => {
			if(!localPasswords) return this.props.enqueueSnackbar(err, { variant: 'error' })
			this.props.enqueueSnackbar('Failed to update Passwords', { variant: 'warning' })
		})
	}

	/* Open Context Menu */
	openMenu = (password, e) => {
		this.lastPassword = password
		this.setState({ anchorEl: e.currentTarget })
	}

	/* Handle Right Click on Grid Item */
	handleClick = (password, e) => {
		e.preventDefault()
		this.lastPassword = password
		this.setState({
			cursorX: e.clientX - 2,
			cursorY: e.clientY - 4
		})
	}

	/* Handle Menu Close */
	handleClose = e => {
		let state = { anchorEl: null, cursorX: null, cursorY: null }
		if(e && e.target) {
			switch(e.target.getAttribute('value')) {
				case 'Edit':
					state['editDialog'] = true
					break
				case 'Edit Note':
					state['noteDialog'] = true
					break
				case 'Copy Password':
					copy(decrypt(this.lastPassword.password, JSON.parse(localStorage.getItem('user')).password)).then(() => {
						this.props.enqueueSnackbar('Copied to Clipboard', { variant: 'success' })
					}).catch(() => {
						this.props.enqueueSnackbar('Something went wrong', { variant: 'error' })
					})
					break
				case 'Move to Trash':
					Api.passwords.setTrash(this.lastPassword, 'true').then(res => {
						this.props.enqueueSnackbar(res, { variant: 'success' })
						this.fetchPasswords()
					}).catch(err => {
						this.props.enqueueSnackbar(err, { variant: 'error' })
					})
					break
				case 'Restore':
					Api.passwords.setTrash(this.lastPassword, 'false').then(res => {
						this.props.enqueueSnackbar(res, { variant: 'success' })
						this.fetchPasswords()
					}).catch(err => {
						this.props.enqueueSnackbar(err, { variant: 'error' })
					})
					break
				case 'Delete':
					state['deleteDialog'] = true
					break
				default: break
			}
		}
		this.setState(state)
	}

	/* Tab Navigation */
	handleChange = (e, newValue) => this.setState({ tabValue: newValue })
}

const styles = theme => ({
	root: {
		padding: theme.spacing(2),
		flexGrow: 1
	},
	paper: {
		marginBottom: theme.spacing(2),
		borderRadius: 3
	},
	gridContainer: {
		marginTop: theme.spacing(0),
		overflow: 'scroll',
		[theme.breakpoints.down('xs')]: {
			marginBottom: theme.spacing(6)
		}
	},
	spacer: {
		...theme.mixins.toolbar
	},
	stickToBottom: {
		position: 'fixed',
		zIndex: 99999,
		width: '100%',
		bottom: 0
	}
})

const mapStateToProps = state => { return { searchInput: state.searchInput } }
const mapDispatchToProps = dispatch => { return {} }
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(Passwords)))