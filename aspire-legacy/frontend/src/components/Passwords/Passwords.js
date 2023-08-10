import { BottomNavigation, BottomNavigationAction, Grid, Hidden, Menu, MenuItem, Paper, Tab, Tabs, withStyles } from '@material-ui/core'
import { Delete, GetApp, Publish } from '@material-ui/icons'
import PasswordCreateDialog from './PasswordCreateDialog'
import PasswordDeleteDialog from './PasswordDeleteDialog'
import PasswordEditDialog from './PasswordEditDialog'
import PasswordIconDialog from './PasswordIconDialog'
import PasswordNoteDialog from './PasswordNoteDialog'
import { decrypt } from '../../Utilities'
import PasswordCard from './PasswordCard'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import PasswordFab from './PasswordFab'
import { connect } from 'react-redux'
import LazyLoad from 'react-lazyload'
import copy from 'clipboard-copy'
import Api from '../../Api'

class Passwords extends Component {
	constructor(props) {
		super(props)
		this.state = {
			data: [],
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
		const { data, anchorEl, cursorX, cursorY, tabValue, createDialog, editDialog, deleteDialog, iconDialog, noteDialog } = this.state
		const { fetchPasswords, openMenu, handleClick, handleClose, handleChange } = this
		const { classes, searchInput } = this.props

		let filteredData = data.filter(e => { if (searchInput.length === 0 || e.site.toLowerCase().includes(searchInput) || e.username.toLowerCase().includes(searchInput) || e.email.toLowerCase().includes(searchInput)) return true; else return false })
		filteredData = filteredData.map(e => { return { ...e, site: e.site.toLowerCase() } })
		filteredData = filteredData.filter(e => tabValue === 2 ? e.trash === 'true' : e.trash !== 'true')
		filteredData.sort((a, b) => a.site < b.site ? -1 : a.site > b.site ? 1 : 0)
		filteredData.sort((a, b) => tabValue === 1 ? a.site > b.site ? -1 : a.site < b.site ? 1 : 0 : 1)

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
					{filteredData.map(item =>
						<Grid item xs={12} key={item.id}>
							<LazyLoad>
								<PasswordCard item={item} openMenu={openMenu} onDoubleClick={() => { this.setState({ editDialog: true }); this.lastItem = item }} onContextMenu={e => handleClick(item, e)} openIconDialog={item => this.setState({ iconDialog: true, iconDialogeData: item })} />
							</LazyLoad>
						</Grid>
					)}
				</Grid>
				<PasswordFab onClick={() => this.setState({ createDialog: true })} />
				<PasswordCreateDialog open={createDialog} update={fetchPasswords} onClose={() => this.setState({ createDialog: false })} />
				<PasswordEditDialog open={editDialog} update={fetchPasswords} values={this.lastItem} onClose={() => this.setState({ editDialog: false })} />
				<PasswordNoteDialog open={noteDialog} update={fetchPasswords} values={this.lastItem} onClose={() => this.setState({ noteDialog: false })} />
				<PasswordDeleteDialog open={deleteDialog} update={fetchPasswords} item={this.lastItem} onClose={() => this.setState({ deleteDialog: false })} />
				<PasswordIconDialog open={iconDialog} update={fetchPasswords} item={this.state.iconDialogeData || {}} onClose={() => this.setState({ iconDialog: false })} />
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
		document.title = 'Passwords - Aspire'
		Api.passwords.fetch().then(res => {
			this.setState({ data: res })
			localStorage.setItem('passwords', JSON.stringify(res))
		}).catch(err => {
			const localPasswords = localStorage.getItem('passwords')
			if(localPasswords) this.setState({ data: JSON.parse(localPasswords) })
			else this.props.enqueueSnackbar(err, { variant: 'error' })
		})
	}

	/* Open Context Menu */
	openMenu = (item, e) => {
		this.lastItem = item
		this.setState({ anchorEl: e.currentTarget })
	}

	/* Handle Right Click on Grid Item */
	handleClick = (item, e) => {
		e.preventDefault()
		this.lastItem = item
		this.setState({
			cursorX: e.clientX - 2,
			cursorY: e.clientY - 4
		})
	}

	/* Handle Menu Close */
	handleClose = e => {
		let state = { anchorEl: null, cursorX: null, cursorY: null }
		if(e?.target) {
			switch(e.target.getAttribute('value')) {
				case 'Edit':
					state['editDialog'] = true
					break
				case 'Edit Note':
					state['noteDialog'] = true
					break
				case 'Copy Password':
					copy(decrypt(this.lastItem.password, JSON.parse(localStorage.getItem('user')).password)).then(() => {
						this.props.enqueueSnackbar('Copied to Clipboard', { variant: 'success' })
					}).catch(() => {
						this.props.enqueueSnackbar('Something went wrong', { variant: 'error' })
					})
					break
				case 'Move to Trash':
					Api.passwords.setTrash(this.lastItem, 'true').then(res => {
						this.props.enqueueSnackbar(res, { variant: 'success' })
						this.fetchPasswords()
					}).catch(err => {
						this.props.enqueueSnackbar(err, { variant: 'error' })
					})
					break
				case 'Restore':
					Api.passwords.setTrash(this.lastItem, 'false').then(res => {
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
		overflow: 'scroll',
		marginTop: theme.spacing(0),
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

const mapStateToProps = state => ({
	searchInput: state.generic.searchInput
})
const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(Passwords)))