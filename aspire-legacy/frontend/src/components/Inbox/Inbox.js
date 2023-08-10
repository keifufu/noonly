import { Backdrop, BottomNavigation, BottomNavigationAction, Button, Card, Checkbox, CircularProgress, Grid, Hidden, IconButton, Menu, MenuItem, Select, Tooltip, withStyles } from '@material-ui/core'
import { AllInbox, Archive, GetApp, Delete, DeleteForever, Forward, IndeterminateCheckBox, Markunread, MoveToInbox, Refresh, Reply, ReplyAll, Star, StarOutline } from '@material-ui/icons'
import InboxComposeDialog from './InboxComposeDialog'
import InboxDeleteDialog from './InboxDeleteDialog'
import { generatePassword } from '../../Utilities'
import { withRouter } from 'react-router-dom'
import { setInboxLoading } from '../../redux'
import InboxItemFull from './InboxItemFull'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'
import LazyLoad from 'react-lazyload'
import { connect } from 'react-redux'
import InboxItem from './InboxItem'
import { saveAs } from 'file-saver'
import InboxFab from './InboxFab'
import Api from '../../Api'

class Inbox extends Component {
	constructor(props) {
		super(props)
		this.state = {
			data: [],
			selected: [],
			viewing: null,
			tabValue: 0,
			cursorX: null,
			cursorY: null,
			location: 'inbox',
			address: '',
			composeDialog: false,
			deleteDialog: false,
			anchorEl: null
		}
	}

	render() {
		const { classes, loading } = this.props
		const { data: _data, selected, viewing, tabValue, cursorX, cursorY, location, composeDialog, deleteDialog, anchorEl } = this.state
		const { onInboxItemActionClick, downloadItems, deleteItems, setLocation, onSelectChange, createToolbarButton, setRead, fetchInbox, onInboxItemDoubleClick, handleTabChange, onInboxItemContextMenu, createContextMenu, handleClose, onCardCheckbox, setFavorite, onToolbarCheckbox } = this
		const data = _data.filter(e => e.location === location).sort((a, b) => Date.parse(b.date) / 1000 - Date.parse(a.date) / 1000)
		const menuContent = createContextMenu()

		const inboxItemData = item => ({
			item,
			selected,
			onCheckboxChange: e => onCardCheckbox(e, item),
			onContextMenu: e => onInboxItemContextMenu(e, item),
			onDoubleClick: e => onInboxItemDoubleClick(e, item),
			setFavorite: value => setFavorite([item], value),
			onActionClick: e => onInboxItemActionClick(e, item)
		})

		if(viewing !== null) {
			return (
				<div className={classes.root}>
					<div className={classes.spacer} />
					<Backdrop open={loading} className={classes.backdrop}> <CircularProgress color='inherit' /> </Backdrop>
					<Grid container spacing={1} className={classes.viewingGridContainer}>
						<Grid item xs={12}>
							<InboxItemFull data={{ item: viewing, setFavorite: value => setFavorite([viewing], value) }} />
						</Grid>
						{viewing.replies && this.mapReplies(viewing)}
					</Grid>
				</div>
			)
		} else {
			return (<>
				<div className={classes.root}>
					<div className={classes.spacer} />
					<Backdrop open={loading} className={classes.backdrop}> <CircularProgress color='inherit' /> </Backdrop>
					<Card className={classes.toolbar}>
						<Tooltip title={selected.length > 0 ? 'Unselect all' : 'Select all'} enterDelay={500}>
							<Checkbox color='primary' onChange={onToolbarCheckbox} checked={selected.length > 0} checkedIcon={<IndeterminateCheckBox />} />
						</Tooltip>
						{selected.length > 0 ? (<>
							{createToolbarButton('Archive', Archive)}
							{selected.find(e => e.read) ? 
							createToolbarButton('Mark as unread', Markunread, () => setRead(selected, false)) :
							createToolbarButton('Mark as read', Markunread, () => setRead(selected, true)) }
							{selected.find(e => e.favorite) ?
							createToolbarButton('Remove from favorites', StarOutline, () => setFavorite(selected, false)) :
							createToolbarButton('Add to favorites', Star, () => setFavorite(selected, true)) }
							{location === 'trash' ? (<>
							{createToolbarButton('Move to Inbox', MoveToInbox, () => setLocation(selected, 'inbox'))}
							{createToolbarButton('Delete Forever', DeleteForever, () => this.setState({ deleteDialog: true }))} </>) :
							createToolbarButton('Move to Trash', Delete, () => setLocation(selected, 'trash')) }
							{ createToolbarButton('Download', GetApp, () => downloadItems(selected)) }
						</>) : (<>
							{createToolbarButton('Refresh', Refresh, fetchInbox)}
							{createToolbarButton('Mark all as read', Markunread, () => setRead(data, true))}
						</>)}
						<Hidden xsDown>
							<Select onChange={onSelectChange} className={classes.select} disableUnderline value={location}>
								<MenuItem value='inbox'>Inbox</MenuItem>
								<MenuItem value='trash'>Trash</MenuItem>
							</Select>
						</Hidden>
					</Card>
					<Grid container spacing={1} className={classes.gridContainer}>
						{data.map((item, i) => (
							<Grid item xs={12} key={i}>
								<LazyLoad>
									<InboxItem data={inboxItemData(item)} />
								</LazyLoad>
							</Grid>
						))}
					</Grid>
				</div>
				<InboxDeleteDialog open={deleteDialog} onSubmit={() => deleteItems(selected)} onClose={() => this.setState({ deleteDialog: false })} />
				<InboxComposeDialog open={composeDialog} onClose={() => this.setState({ composeDialog: false })} />
				<InboxFab data={{ location, setState: state => this.setState(state) }} />
				<Menu keepMounted open={Boolean(anchorEl)} anchorEl={anchorEl} transformOrigin={{ horizontal: 150, vertical: -125 }} onClose={handleClose}>{menuContent}</Menu>
				<Menu keepMounted open={cursorY !== null} anchorReference='anchorPosition' anchorPosition={cursorX !== null && cursorY !== null ? { top: cursorY, left: cursorX } : undefined} onClose={handleClose}>{menuContent}</Menu>
				<Hidden smUp>
					<BottomNavigation showLabels value={tabValue} onChange={handleTabChange} className={classes.stickToBottom}>
						<BottomNavigationAction label='Inbox' icon={<AllInbox />} />
						<BottomNavigationAction label='Trash' icon={<Delete />} />
					</BottomNavigation>
				</Hidden>
			</>)
		}
	}

	componentDidMount = () => this.fetchInbox()
	componentDidUpdate = prevProps => {
		if(this.props.location !== prevProps.location) this.updateLocation(this.state.data)
	}

	fetchInbox = () => {
		const { addresses } = JSON.parse(localStorage.getItem('user'))
		this.setState({ address: addresses[0].toLowerCase() })
		const { enqueueSnackbar, setLoading } = this.props
		const timeout = setTimeout(() => setLoading(true), 500)
		Api.inbox.fetch().then(res => {
			clearTimeout(timeout)
			setLoading(false)
			this.setState({ data: res[this.state.address] })
			this.updateLocation(res[this.state.address])
		}).catch(err => {
			clearTimeout(timeout)
			setLoading(false)
			enqueueSnackbar(err, { variant: 'error' })
		})
	}

	/* Update viewing Item depending on pathname */
	updateLocation = data => {
		document.title = 'Inbox - Aspire'
		let pathname = document.location.pathname.replace('/inbox', '')
		if(pathname.startsWith('/')) pathname = pathname.slice(1)
		if(pathname.endsWith('/')) pathname = pathname.slice(0, -1)
		const items = pathname.split('/')
		if(['trash'].includes(items[0].toLowerCase())) {
			this.setState({ location: 'trash' })
			document.title = 'Trash - Aspire'
			const item = data.find(e => e.aspire_id === items[1])
			if(!items[1] || items[1].length === 0) {
				if(this.state.viewing !== null) this.setState({ location: 'trash', selected: [], viewing: null })
				return
			}
			if(item && this.state.viewing !== item) this.setState({ location: 'trash', selected: [], viewing: item })
			else if(!item) this.props.history.push('/inbox/trash')
			if(item) document.title = `${item.subject} - Aspire`
		} else {
			this.setState({ location: 'inbox' })
			const item = data.find(e => e.aspire_id === pathname)
			if(pathname.length === 0) {
				if(this.state.viewing !== null) this.setState({ location: 'inbox', selected: [], viewing: null })
				return
			}
			if(item && this.state.viewing !== item) this.setState({ location: 'inbox', selected: [], viewing: item })
			else if(!item) this.props.history.push('/inbox')
			if(item) document.title = `${item.subject} - Aspire`
		}
	}

	onSelectChange = (e, x) => {
		const { history } = this.props
		const pathname = x.props.value === 'Inbox' ? '/inbox' : `/inbox/${x.props.value.toLowerCase()}`
		history.push(pathname)
	}

	createToolbarButton = (tooltip, icon, onClick) => {
		const { classes } = this.props
		const Icon = icon
		return (
			<Tooltip title={tooltip} enterDelay={250}>
				<IconButton onClick={onClick} className={classes.toolbarButton}>
					<Icon />
				</IconButton>
			</Tooltip>
		)
	}

	/* Create Context Menu */
	createContextMenu = () => {
		const { selected, location } = this.state
		const { classes } = this.props
		const { handleClose } = this

		const menu = [
			{ name: 'Reply', icon: Reply },
			{ name: 'Reply to all', icon: ReplyAll },
			{ name: 'Forward', icon: Forward },
			{ name: 'Mark as read', icon: Markunread, behavior: 'hasunread' },
			{ name: 'Mark as unread', icon: Markunread, behavior: 'hasread' },
			{ name: 'Move to Trash', icon: Delete, behavior: 'notrash' },
			{ name: 'Move to Inbox', icon: MoveToInbox, behavior: 'trashonly' },
			{ name: 'Delete Forever', icon: DeleteForever, behavior: 'trashonly' },
			{ name: 'Download', icon: GetApp },
		]

		const generateContent = (arr) => {
			return (<div>
				{arr.filter(e => {
					const { behavior } = e
					if(!behavior) return true
					if(behavior.includes('notrash') && location === 'trash') return false
					if(behavior.includes('trashonly') && location !== 'trash') return false
					if(behavior.includes('hasread') && !selected.find(e => e.read)) return false
					if(behavior.includes('hasunread') && selected.find(e => e.read)) return false
					return true
				}).map((e, i) => {
					const Component = e.icon
					const menuIcon = <Component color='primary' className={classes.menuIcon} />
					const menuItem = <MenuItem value={e.name} onClick={handleClose} key={i}>{menuIcon}{e.name}</MenuItem>
					return menuItem
				})}
			</div>)
		}

		const menuContent = generateContent(menu)
		return menuContent
	}

	/**
	 * Map replies of Mail Item to 'InboxItemFull' recursively
	 * @param {Object} item - Mail Item
	 * @returns {HTMLElement}
	 **/
	mapReplies = item => {
		return item.replies.map(item => {
			const gridItem = <Grid item xs={12} key={generatePassword(7)}><InboxItemFull data={{ item, isResponse: true, expanded: true, setFavorite: value => this.setFavorite([item], value) }}/></Grid>
			if(item.replies) {
				/**
				 * Dont replace React.Fragment with a div, it will break the styling for some Reason
				 * Also, the Reason we use React.Fragement instead of <> here is that we need to give it a key
				 **/
				return (<React.Fragment key={generatePassword(7)}>
					{gridItem}
					{this.mapReplies(item)}
				</React.Fragment>)
			} else return gridItem
		})
	}

	/**
	 * Selects all Items of none are selected
	 * Unselects all items if any are selected
	 **/
	onToolbarCheckbox = () => {
		let { selected, data, location } = this.state
		if(selected.length > 0) selected = []
		else data.forEach(item => { if(item.location === location) selected.push(item) })
		this.setState({ selected })
	}

	/**
	 * Handles Context Menu Event on 'InboxItem'
	 * @param {Object} e - Event Object
	 * @param {Object} item - Mail Item
	 **/
	onInboxItemContextMenu = (e, item) => {
		e.preventDefault()
		if(!this.state.selected.includes(item)) this.setState({ selected: [item] })
		this.setState({
			cursorX: e.clientX - 2,
			cursorY: e.clientY - 4
		})
	}

	/**
	 * Handles Double Click Event on 'InboxItem'
	 * @param {Object} e - Event Object
	 * @param {Object} item - Mail Item
	 **/
	onInboxItemDoubleClick = (e, item) => {
		if(this.state.location === 'inbox') this.props.history.push(`/inbox/${item.aspire_id}`)
		else this.props.history.push(`/inbox/${this.state.location}/${item.aspire_id}`)
		this.setState({ selected: [], viewing: item })
		if(!item.read) this.setRead([item], true)
	}

	onInboxItemActionClick = (e, item) => {
		const state = { anchorEl: e.target }
		if(!this.state.selected.includes(item)) state.selected = [item]
		this.setState(state)
	}

	/**
	 * Set read state of Mail Items as to not re-fetch all Mail
	 * @param {Array} items - Array of Mail Items
	 * @param {Boolean} favorite - If Mail is favorite or not
	 **/
	setFavorite = (items, favorite) => {
		const { enqueueSnackbar } = this.props
		const { data } = this.state
		let changed = false
		data.forEach(item => {
			if(!items.includes(item)) return
			if(item.favorite === favorite) return
			item.favorite = favorite
			changed = true
		})
		if(!changed) return
		this.setState({ data })
		Api.inbox.setFavorite(items, favorite).then(res => {
			enqueueSnackbar(res, { variant: 'success' })
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
			this.fetchInbox()
		})
	}

	/**
	 * Set read state of Mail Items as to not re-fetch all Mail
	 * @param {Array} items - Array of Mail Items
	 * @param {Boolean} read - If Mail has been read or not
	 **/
	setRead = (items, read) => {
		const { data } = this.state
		let changed = false
		data.forEach(item => {
			if(!items.includes(item)) return
			if(item.read === read) return
			item.read = read
			changed = true
		})
		if(!changed) return
		this.setState({ data })
		Api.inbox.setRead(items, read)
	}

	/**
	 * Download all items as .eml Files
	 * @param {Array} items - Array of Mail Items
	 **/
	downloadItems = (items) => {
		const { enqueueSnackbar } = this.props
		Api.inbox.download(items).then(res => {
			const ext = items.length === 1 ? 'eml' : 'zip'
			const name = `mail.${ext}`
			saveAs(new Blob([res.data]), name)
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
		})
	}

	/**
	 * Delete Mail Items as to not re-fetch all Mail
	 * @param {Array} items - Array of Mail Items
	 **/
	deleteItems = (items) => {
		const { enqueueSnackbar } = this.props
		const { data } = this.state
		this.setState({ data: data.filter(item => !items.includes(item)), selected: [] })
		Api.inbox.delete(items).then(res => {
			enqueueSnackbar(res, { variant: 'success' })
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
			this.fetchInbox()
		})
	}

	/**
	 * Set location state of Mail Items as to not re-fetch all Mail
	 * @param {Array} items - Array of Mail Items
	 * @param {String} location - Location of the Items
	 * @param {Boolean} isUndo - Internal variable to keep track of snackbars
	 **/
	setLocation = (items, location, isUndo = false) => {
		const { enqueueSnackbar, closeSnackbar } = this.props
		const { data } = this.state
		const oldLocation = items[0].location
		let changed = false
		data.forEach(item => {
			if(!items.includes(item)) return
			if(item.location === location) return
			item.location = location
			changed = true
		})
		if(!changed) return
		this.setState({ data, selected: [] })
		Api.inbox.setLocation(items, location).then(res => {
			const undo = key => {
				closeSnackbar(key)
				this.setLocation(items, oldLocation, true)
			}
			enqueueSnackbar(res, { variant: 'success', action: key => !isUndo && <Button style={{ color:'#fff' }} onClick={() => undo(key)}>Undo</Button> })
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
			this.fetchInbox()
		})
	}

	/* On Card Checkbox Change */
	onCardCheckbox = (e, item) => {
		const { selected } = this.state
		if(selected.includes(item)) selected.splice(selected.indexOf(item), 1)
		else selected.push(item)
		this.setState({ selected })
	}

	/* Handle Menu Close */
	handleClose = e => {
		const { selected } = this.state
		let state = { cursorX: null, cursorY: null, anchorEl: null }
		if(e?.target) {
			switch(e.target.getAttribute('value')) {
				case 'Reply':
					break
				case 'Reply to all':
					break
				case 'Forward':
					break
				case 'Mark as read':
					this.setRead(selected, true)
					break
				case 'Mark as unread':
					this.setRead(selected, false)
					break
				case 'Move to Trash':
					this.setLocation(selected, 'trash')
					break
				case 'Move to Inbox':
					this.setLocation(selected, 'inbox')
					break
				case 'Delete Forever':
					state['deleteDialog'] = true
					break
				case 'Download':
					this.downloadItems(selected)
					break
			default: break
			}
		}
		this.setState(state)
	}

	/* Tab Navigation */
	handleTabChange = (e, value) => this.setState({ tabValue: value, location: value === 0 ? 'inbox' : 'trash' })
}

const styles = theme => ({
	root: {
		padding: theme.spacing(2),
		height: '100vh',
		width: '100%',
		flexGrow: 1
	},
	spacer: {
		...theme.mixins.toolbar
	},
	stickToBottom: {
		position: 'fixed',
		zIndex: 99999,
		width: '100%',
		bottom: 0
	},
	menuIcon: {
		marginLeft: -theme.spacing(1),
		marginRight: theme.spacing(1),
		pointerEvents: 'none'
	},
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff'
	},
	toolbar: {
		marginBottom: theme.spacing(1),
		paddingLeft: theme.spacing(1),
		alignItems: 'center',
		display: 'flex',
		height: 48
	},
	toolbarButton: {
		height: 42,
		width: 42
	},
	gridContainer: {
		paddingBottom: theme.spacing(18),
		overflow: 'scroll',
		maxHeight: '100vh'
	},
	viewingGridContainer: {
		paddingBottom: theme.spacing(11),
		overflow: 'scroll',
		maxHeight: '100vh'
	},
	select: {
		marginRight: theme.spacing(1),
		marginLeft: 'auto',
		order: 2
	}
})

const mapStateToProps = state => ({ loading: state.inbox.loading })
const mapDispatchToProps = dispatch => ({
	setLoading: value => dispatch(setInboxLoading(value))
})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(withRouter(Inbox))))