import { Backdrop, BottomNavigation, BottomNavigationAction, CircularProgress, Grid, Hidden, Menu, MenuItem, withStyles, withWidth } from '@material-ui/core'
import { Delete, DeleteForever, FileCopy, GetApp, Info, Link, Publish, Refresh, Visibility } from '@material-ui/icons'
import ScreenshotDetailsDialog from './ScreenshotDetailsDialog'
import CloudTreeDialog from '../Cloud/CloudTreeDialog'
import InfiniteScroll from 'react-infinite-scroller'
import { setScreenshotsLoading } from '../../redux'
import ScreenshotCard from './ScreenshotCard'
import ScreenshotFab from './ScreenshotFab'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'
import ImageViewer from '../ImageViewer'
import { connect } from 'react-redux'
import LazyLoad from 'react-lazyload'
import { saveAs } from 'file-saver'
import copy from 'clipboard-copy'
import Api from '../../Api'

class Screenshots extends Component {
	constructor(props) {
		super(props)
		this.state = {
			data: [],
			selected: [],
			cursorX: null,
			cursorY: null,
			value: 0,
			treeDialog: false,
			imageViewer: false,
			detailsDialog: false,
			page: 1
		}
	}
	
	render() {
		const { cursorX, cursorY, value, data, treeDialog, imageViewer, detailsDialog, selected, page } = this.state
		const { copyToCloud, handleRootClick, handleClick, handleClose, handleChange, openImageViewer, onCardClick } = this
		const { classes, loading } = this.props

		const menuContent = (<div>
			{!selected.length > 0 && <MenuItem value='View' onClick={handleClose}><Visibility color='primary' className={classes.menuIcon} />View</MenuItem>}
			{!selected.length > 0 && <MenuItem value='Details' onClick={handleClose}><Info color='primary' className={classes.menuIcon} />Details</MenuItem>}
			<MenuItem value='Copy URL' onClick={handleClose}><Link color='primary' className={classes.menuIcon} />Copy URL</MenuItem>
			<MenuItem value='Copy to Cloud' onClick={handleClose}><FileCopy color='primary' className={classes.menuIcon} />Copy to Cloud</MenuItem>
			<MenuItem value='Download' onClick={handleClose}><GetApp color='primary' className={classes.menuIcon} />Download</MenuItem>
			<MenuItem value='Delete' onClick={handleClose}><DeleteForever color='primary' className={classes.menuIcon} />Delete</MenuItem>	
		</div>)

		const rootMenuContent = ( <div>
			<MenuItem value='Refresh' onClick={handleClose}><Refresh color='primary' className={classes.menuIcon} />Refresh</MenuItem>
		</div> )

		const filteredData = data.sort((a, b) => value === 1 ? a.id - b.id : b.id - a.id).filter(e => value === 2 ? e.inTrash : true).slice(0, page * 25)
		return (<>
			<div className={classes.root} onContextMenu={handleRootClick} onMouseDownCapture={e => { if(e.button === 2) handleClose() }}>
				<Backdrop className={classes.backdrop} open={loading}><CircularProgress color='inherit' /></Backdrop>
				<div className={classes.spacer} id='back-to-top-anchor'/>
				<InfiniteScroll pageStart={1} loadMore={this.setPage} hasMore={data.length > page * 25} threshold={1500} useWindow={true}>
					<Grid id='screenshots' container spacing={2} direction='row'>
						{filteredData.map(item =>
							<Grid item xs={12} sm={4} md={4} lg={3} key={item.id}>
								<LazyLoad offset={250}>
									<ScreenshotCard onClick={e => onCardClick(e, item)} onContextMenu={e => handleClick(item, e)} isSelected={selected.includes(item)} setState={state => this.setState(state)} getState={() => this.state} item={item} onDoubleClick={() => openImageViewer(item)} />
								</LazyLoad>
							</Grid>
						)}
					</Grid>
				</InfiniteScroll>
				<ScreenshotFab />
				<ScreenshotDetailsDialog open={detailsDialog} data={this.state.detailsDialogData || {}} handleClose={() => this.setState({ detailsDialog: false })} />
				<ImageViewer open={imageViewer} data={this.state.imageViewerData || {}} onClose={() => this.setState({ imageViewer: false })} />
				<CloudTreeDialog open={treeDialog} onSubmit={copyToCloud} onClose={() => this.setState({ treeDialog: false })} />
				<Menu id='menu-screenshots' anchorReference='anchorPosition' anchorPosition={cursorX !== null && cursorY !== null ? { top: cursorY, left: cursorX } : undefined} keepMounted open={cursorY !== null} onClose={handleClose}>{this.rootMenu ? rootMenuContent : menuContent}</Menu>
			</div>
			<Hidden smUp>
				<BottomNavigation value={value} onChange={handleChange} showLabels className={classes.stickToBottom}>
					<BottomNavigationAction label='Newest' icon={<Publish />}/>
					<BottomNavigationAction label='Oldest' icon={<GetApp />}/>
					<BottomNavigationAction label='Trash' icon={<Delete />}/>
				</BottomNavigation>
			</Hidden>
		</>)
	}
	
	componentDidMount = () => this.fetchScreenshots()

	fetchScreenshots = () => {
		document.title = 'Screenshots - Aspire'
		const { enqueueSnackbar, setLoading } = this.props
		const timeout = setTimeout(() => setLoading(true))
		Api.screenshots.fetch().then(res => {
			clearTimeout(timeout)
			setLoading(false)
            this.setState({ data: res, visible: [0, 2500] })
        }).catch(err => {
			clearTimeout(timeout)
			setLoading(false)
			enqueueSnackbar(err, { variant: 'error' })
        })
	}

	/* Let react-infinite-scroller set the current Page */
	setPage = page => {
		if(this.state.page === page) return
		this.setState({ page })
	}

	/* Open the Image Viewer */
	openImageViewer = ss => {
		this.setState({
			imageViewer: true,
			imageViewerData: { src: `https://aspire.icu/ss/${ss.account_username}/${ss.name}`, width: this.props.width }
		})
	}

	/* Copies lastItem or selected items to specified path */
	copyToCloud = _path => {
		const { enqueueSnackbar } = this.props
		const { selected } = this.state
		const location = _path.startsWith('cloud/shared') ? 'shared' : 'user'
		let path = location === 'shared' ? _path.replace('cloud/shared', '') : _path.replace(`cloud/user/${this.lastItem.account_username}`, '')
		if(!path.startsWith('/')) path = `/${path}`
		if(path !== '/' && path.endsWith('/')) path = path.slice(0, -1)
		let arg1 = 'copyToCloud'
		let arg2 = { path , location, name: this.lastItem.name }
		if(selected.length > 0) {
			arg1 = 'copyMultipleToCloud'
			arg2 = selected.map(item => { return { path, location, name: item.name } })
		}
		Api.screenshots[arg1](arg2).then(res => {
			enqueueSnackbar(res, { variant: 'success' })
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
		})
	}

	/* Copies all selected items or prop to clipboard */
	copyUrl = item => {
		const { enqueueSnackbar } = this.props
		const { selected } = this.state
		let toCopy = `https://aspire.icu/ss/${item.account_username}/${item.name}`
		if(selected.length > 0) toCopy = selected.map(item => `https://aspire.icu/ss/${item.account_username}/${item.name}`).join(' ')
		copy(toCopy).then(() => {
			enqueueSnackbar('Copied to Clipboard', { variant: 'success' })
		}).catch(() => {
			enqueueSnackbar('Something went wrong', { variant: 'error' })
		})
	}

	/* Downloads all selected items or prop as file */
	download = item => {
		const { selected } = this.state
		if(selected.length > 0) selected.forEach(item => this._download(item))
		else this._download(item)
	}

	_download = item => {
		const { enqueueSnackbar } = this.props
		Api.screenshots.download(`https://aspire.icu/ss/${item.account_username}/${item.name}`).then(res => {
			saveAs(new Blob([res.data]), item.name)
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
		})
	}

	/* Handle clicks on Cards */
	onCardClick = (e, item) => {
		if(!e.ctrlKey) return
		const { selected } = this.state
		selected.includes(item) ? selected.splice(selected.indexOf(item), 1) : selected.push(item)
		this.setState({ selected })
	}

	/* Handle Right Click on root div */
	handleRootClick = e => {
		e.preventDefault()
		if(this.menuOpen) return
		this.rootMenu = true
		this.setState({
			cursorX: e.clientX - 2,
			cursorY: e.clientY - 4
		})
	}

	/* Handle Right Click on Grid Item */
	handleClick = (item, e) => {
		e.preventDefault()
		this.menuOpen = true
		this.rootMenu = false
		this.lastItem = item
		this.setState({
			cursorX: e.clientX - 2,
			cursorY: e.clientY - 4
		})
	}

	handleClose = e => {
		const { fetchScreenshots, openImageViewer, copyUrl, download } = this
		let state = { anchorEl: null, cursorX: null, cursorY: null }
		if(e?.target) {
			const _e  = e.target.tagName === 'path' ? e.target.parentNode.parentNode : e.target.tagName === 'svg' ? e.target.parentNode : e.target
			switch(_e.getAttribute('value')) {
				case 'Refresh':
					fetchScreenshots()
					break
				case 'View':
					openImageViewer(this.lastItem)
					break
				case 'Details':
					state['detailsDialog'] = true
					state['detailsDialogData'] = this.lastItem
					break
				case 'Copy URL':
					copyUrl(this.lastItem)
					break
				case 'Copy to Cloud':
					state['treeDialog'] = true
					break
				case 'Download':
					download(this.lastItem)
					break
				case 'Delete':
					console.log('Delete')
					break
				default: break
			}
		}
		this.setState(state)
	}

	handleChange = (e, newValue) => this.setState({ value: newValue })
}

const styles = theme => ({
	root: {
		flexGrow: 1,
		padding: theme.spacing(2),
		marginBottom: theme.spacing(7),
		minHeight: '100vh',
		width: '100%',
		[theme.breakpoints.down('xs')]: {
			marginTop: theme.spacing(1)
		}
	},
	spacer: {
		...theme.mixins.toolbar
	},
	stickToBottom: {
		width: '100%',
		position: 'fixed',
		bottom: 0
	},
	menuIcon: {
		marginLeft: -theme.spacing(1),
		marginRight: theme.spacing(1)
	},
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff'
	}
})

const mapStateToProps = state => ({
	loading: state.screenshots.loading
})
const mapDispatchToProps = dispatch => ({
	setLoading: value => dispatch(setScreenshotsLoading(value))
})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(withWidth()(Screenshots))))