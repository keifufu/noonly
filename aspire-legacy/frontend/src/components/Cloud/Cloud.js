import { Assignment, CloudDownload, CloudUpload, Create, CreateNewFolder, Delete, DeleteForever, FileCopy, Folder, FolderShared, OpenWith, Refresh, Restore, Share, Visibility } from '@material-ui/icons'
import { Backdrop, BottomNavigation, BottomNavigationAction, Button, CircularProgress, Grid, Hidden, Menu, MenuItem, Typography, withStyles, withWidth } from '@material-ui/core'
import { reloadCloudTree, setCloudLoading } from '../../redux'
import CloudEexistDialog from './CloudEexistDialog'
import CloudRenameDialog from './CloudRenameDialog'
import CloudDeleteDialog from './CloudDeleteDialog'
import CloudCreateDialog from './CloudCreateDialog'
import CloudShareDialog from './CloudShareDialog'
import CloudBreadcrumbs from './CloudBreadcrumbs'
import CloudTextEditor from './CloudTextEditor'
import CloudTreeDialog from './CloudTreeDialog'
import CloudFolderCard from './CloudFolderCard'
import CustomDragLayer from './CustomDragLayer'
import withScrolling from 'react-dnd-scrolling'
import { withRouter } from 'react-router-dom'
import CloudTransfers from './CloudTransfers'
import textExtensions from 'text-extensions'
import CloudFileCard from './CloudFileCard'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import ImageViewer from '../ImageViewer'
import { connect } from 'react-redux'
import LazyLoad from 'react-lazyload'
import { saveAs } from 'file-saver'
import CloudFab from './CloudFab'
import Api from '../../Api'
import nodePath from 'path'
import axios from 'axios'

const ScrollingComponent = withScrolling('div')

class Cloud extends Component {
	constructor(props) {
		super(props)
		this.state = {
			data: { user: [], trash: [], shared: [] },
			currentData: { files: [], folders: [] },
			selected: [],
			location: 'user',
			anchorEl: null,
			cursorX: null,
			cursorY: null,
			tabValue: 0,
			treeDialog: false,
			createDialog: false,
			renameDialog: false,
			deleteDialog: false,
			shareDialog: false,
			eexistDialog: false,
			textEditor: false,
			imageViewer: false,
			currentTransfers: {}
		}
	}

	render() {
		const { props, state, createContextMenus, fetchCloudStorage, filterArray, onCardClick, openMenu, handleRootClick, handleClick, handleClose, setPath, handleTabChange, moveCopyItem, onDoubleClick } = this
		const { selected, location, currentData, anchorEl, cursorX, cursorY, tabValue, treeDialog, createDialog, renameDialog, deleteDialog, shareDialog, eexistDialog, textEditor, imageViewer, currentTransfers } = state
		const { classes, searchInput, cloudLoading } = props
		const { files, folders } = currentData

		const filteredFiles = filterArray(files, searchInput)
		const filteredFolders = filterArray(folders, searchInput)
		const { menuContent, rootMenuContent } = createContextMenus()

		return (<>
			<ScrollingComponent className={classes.root} onContextMenu={handleRootClick} onMouseDownCapture={e => { if(e.button === 2) handleClose() }}>
				<div className={classes.spacer} id='back-to-top-anchor' />
				<Backdrop open={cloudLoading} className={classes.backdrop}> <CircularProgress color='inherit' /> </Backdrop>
				<CloudBreadcrumbs data={{ update: fetchCloudStorage, moveCopyItem, selected, location }} />
				{Object.values(filteredFolders).length > 0 && (<>
					<Typography className={classes.typography}>Folders</Typography>
					<Grid container className={classes.gridContainer} spacing={2}>
						{Object.values(filteredFolders).map((item, i) => (
							<Grid item xs={6} sm={4} md={3} lg={2} key={i}>
								<LazyLoad>
									<CloudFolderCard onClick={e => onCardClick(e, item)} onContextMenu={e => handleClick(e, item)} moveCopyItem={moveCopyItem} fetchCloudStorage={fetchCloudStorage} selected={selected} isSelected={selected.includes(item)} location={location} openMenu={openMenu} onDoubleClick={() => setPath(item.name)} folder={item} />
								</LazyLoad>
							</Grid>
						))}
					</Grid>
				</>)}
				{filteredFiles.length > 0 && (<>
					<Typography className={classes.typography}>Files</Typography>
					<Grid container className={classes.gridContainer} spacing={2}>
						{filteredFiles.map((item, i) => (
							<Grid item xs={12} sm={4} md={3} lg={2} key={i}>
								<LazyLoad>
									<CloudFileCard onClick={e => onCardClick(e, item)} onContextMenu={e => handleClick(e, item)} onDoubleClick={() => onDoubleClick(item)} isSelected={selected.includes(item)} openMenu={openMenu} file={item} />
								</LazyLoad>
							</Grid>
						))}
					</Grid>
				</>)}
				{!cloudLoading && Object.keys(folders).length === 0 && files.length === 0 && <Typography className={classes.h4Typography} variant='h4'>This Folder is empty</Typography>}
				{!cloudLoading && (Object.keys(folders).length !== 0 || files.length !== 0) && Object.keys(filteredFolders).length === 0 && filteredFiles.length === 0 && <Typography className={classes.h4Typography} variant='h4'>No Search Results</Typography>}
				<CloudFab 			data={{ update: fetchCloudStorage, location: location, setState: state => this.setState(state), getState: () => this.state }} />
				<CloudTransfers		open={Object.keys(currentTransfers).length > 0}					data={currentTransfers}									/>
				<ImageViewer		open={imageViewer}	data={this.state.imageViewerData  || {}}	onClose={() => this.setState({ imageViewer: false })}	/>
				<CloudTreeDialog	open={treeDialog}	data={this.state.treeDialogData	  || {}}	onClose={() => this.setState({ treeDialog: false })}	/>
				<CloudTextEditor	open={textEditor}	data={this.state.textEditorData   || {}}	onClose={() => this.setState({ textEditor: false })}	/>
				<CloudShareDialog	open={shareDialog}	data={this.state.shareDialogData  || {}}	onClose={() => this.setState({ shareDialog: false })}	/>
				<CloudEexistDialog	open={eexistDialog}	data={this.state.eexistDialogData || {}}	onClose={() => this.setState({ eexistDialog: false })}	/>
				<CloudCreateDialog	open={createDialog}	data={this.state.createDialogData || {}}	onClose={() => this.setState({ createDialog: false })}	/>
				<CloudRenameDialog	open={renameDialog}	data={this.state.renameDialogData || {}}	onClose={() => this.setState({ renameDialog: false })}	/>
				<CloudDeleteDialog	open={deleteDialog}	data={this.state.deleteDialogData || {}}	onClose={() => this.setState({ deleteDialog: false })}	/>
				<Menu keepMounted open={cursorY !== null} anchorReference='anchorPosition' anchorPosition={cursorX !== null && cursorY !== null ? { top: cursorY, left: cursorX } : undefined} onClose={handleClose}>{this.state.rootMenu ? rootMenuContent : menuContent}</Menu>
				<Menu keepMounted open={Boolean(anchorEl)} anchorEl={anchorEl} transformOrigin={{ horizontal: 110, vertical: -125 }} onClose={handleClose}>{menuContent}</Menu>
				<CustomDragLayer data={{ selected }} />
			</ScrollingComponent>
			<Hidden smUp>
				<BottomNavigation showLabels value={tabValue} onChange={handleTabChange} className={classes.stickToBottom}>
					<BottomNavigationAction label='Shared' icon={<FolderShared />} />
					<BottomNavigationAction label='User' icon={<Folder />} />
					<BottomNavigationAction label='Trash' icon={<Delete />} />
				</BottomNavigation>
			</Hidden>
		</>)
	}

	componentDidMount = () => this.fetchCloudStorage()

	componentDidUpdate = prevProps => {
		if(this.props.location !== prevProps.location) this.fetchCloudStorage()
	}

	fetchCloudStorage = () => {
		const timeout = setTimeout(() => this.props.setCloudLoading(true), 500)
		const pathname = decodeURIComponent(document.location.pathname)
		let location = pathname.replace('/cloud', '')
		location = location.split('/').filter(e => e)[0]
		location = location === 'u' ? 'user' : location
		if(location) document.title = `${location === 'user' ? 'Cloud' : location[0].toUpperCase() + location.slice(1)} - Aspire`
		if(['trash', 'shared', 'user'].includes(location)) {
			const tabValue = location === 'user' ? 1 : location === 'shared' ? 0 : 2
			let path = pathname.replace(`/cloud/${location === 'user' ? 'u' : location}`, '')
			if(!path.startsWith('/')) path = `/${path}`
			if(path !== '/' && path.endsWith('/')) path = path.slice(0, -1)

			/* Combines two arrays with a having priority over b */
			function combineArrays(a, b) { const arr = a; b.forEach(e => { if(!arr.find(x => x.path === e.path)) arr.push(e) }); return arr }

			Api.cloud.fetch({ location, path }).then(res => {
				const newData = {
					user: location === 'user' ? combineArrays(res.user, this.state.data.user) : this.state.data.user,
					trash: location === 'trash' ? combineArrays(res.trash, this.state.data.trash) : this.state.data.trash,
					shared: location === 'shared' ? combineArrays(res.shared, this.state.data.shared) : this.state.data.shared
				}
				const currentData = newData[location].find(e => e.path === path)
				this.setState({ data: newData, currentData, location, tabValue, selected: [], loading: false })
				clearTimeout(timeout)
				this.props.setCloudLoading(false)
			}).catch(err => {
				this.props.enqueueSnackbar(err, { variant: 'warning' })
				this.props.history.push(`/cloud/${location === 'user' ? 'u' : location}`)
				this.fetchCloudStorage()
				clearTimeout(timeout)
				this.props.setCloudLoading(false)
			})
		} else {
			this.props.history.push('/cloud/u/')
			clearInterval(timeout)
			this.props.setCloudLoading(false)
			this.fetchCloudStorage()
		}
	}

	/* Filter array yo */
	filterArray = (arr, searchInput) => {
		arr = arr.filter(e => { if (searchInput.length === 0 || e.name.toLowerCase().includes(searchInput)) return true; else return false })
		arr.sort((a, b) => a.name.localeCompare(b.name))
		return arr
	}

	/* Create Context Menus */
	createContextMenus = () => {
		const { location, selected, lastItem } = this.state
		const { classes } = this.props
		const { handleClose } = this

		const menus = {
			root: [
				{ name: 'Refresh', icon: Refresh },
				{ name: 'New Folder', icon: CreateNewFolder, behavior: 'notrash' },
				{ name: 'Upload Files', icon: CloudUpload, behavior: 'notrash' }
			],
			main: [
				{ name: 'Rename', icon: Create, behavior: 'notrash, noselect' },
				{ name: 'Edit', icon: Assignment, behavior: 'notrash, noselect, textonly' },
				{ name: 'View', icon: Visibility, behavior: 'noselect, imageonly' },
				{ name: 'Share', icon: Share, behavior: 'notrash, noselect' },
				{ name: 'Download', icon: CloudDownload },
				{ name: 'Move', icon: OpenWith, behavior: 'notrash' },
				{ name: 'Copy', icon: FileCopy, behavior: 'notrash'  },
				{ name: 'Restore', icon: Restore, behavior: 'trashonly' },
				{ name: 'Delete', icon: DeleteForever, behavior: 'trashonly' },
				{ name: 'Remove', icon: Delete, behavior: 'notrash' }
			]
		}

		const generateContent = (arr) => {
			return (<div>
				{arr.filter(e => {
					const { behavior } = e
					if(!behavior) return true
					const ext = lastItem && nodePath.extname(lastItem.name).replace('.', '').toLowerCase()
					if(behavior.includes('notrash') && location === 'trash') return false
					if(behavior.includes('noselect') && selected.length > 0) return false
					if(behavior.includes('textonly') && !textExtensions.includes(ext)) return false
					if(behavior.includes('imageonly') && !['jpg', 'jpeg', 'jfif', 'png', 'webm', 'gif'].includes(ext)) return false
					if(behavior.includes('trashonly') && location !== 'trash') return false
					if(behavior.includes('trashonly') && !['/cloud/trash', '/cloud/trash/'].includes(document.location.pathname)) return false
					return true
				}).map((e, i) => {
					const Component = e.icon
					const menuIcon = <Component color='primary' className={classes.menuIcon} />
					const menuItem = <MenuItem value={e.name} onClick={handleClose} key={i}>{menuIcon}{e.name}</MenuItem>
					return menuItem
				})}
			</div>)
		}

		const rootMenuContent = generateContent(menus.root)
		const menuContent = generateContent(menus.main)

		return { menuContent, rootMenuContent }
	}

	/* On Card Click */
	onCardClick = (e, item) => {
		if(!e.ctrlKey) return
		const newSelected = this.state.selected
		newSelected.includes(item) ? newSelected.splice(newSelected.indexOf(item), 1) : newSelected.push(item)
		this.setState({ selected: newSelected })
	}

	/* Handle submit from CloudTreeDialog  */
	moveItem = _path => {
		const { selected, lastItem } = this.state
		const username = JSON.parse(localStorage.getItem('user')).username
		const location = _path.startsWith('cloud/shared') ? 'shared' : 'user'
		let path = location === 'shared' ? _path.replace('cloud/shared', '') : _path.replace(`cloud/user/${username}`, '')
		if(!path.startsWith('/')) path = `/${path}`
		if(path !== '/' && path.endsWith('/')) path = path.slice(0, -1)
		const item = { path: lastItem.path, newPath: `${path}/${lastItem.name}`, location: this.state.location, newLocation: location }
		const undoItem = { path: item.newPath, newPath: item.path, location: item.newLocation, newLocation: item.location }
		const itemArray = selected.map(item => ({ path: item.path, newPath: `${path}/${item.name}`, location: this.state.location, newLocation: location }))
		const undoArray = itemArray.map(item => ({ path: item.newPath, newPath: item.path, location: item.newLocation, newLocation: item.location }))
		this.moveCopyItem(this.action, item, undoItem, itemArray, undoArray, selected)
	}

	/* Move lastItem or selected Items to Trash */
	moveToTrash = () => {
		const { selected, lastItem } = this.state
		const item = { path: lastItem.path, newPath: lastItem.name, location: this.state.location, newLocation: 'trash' }
		const itemArray = selected.map(item => ({ path: item.path, newPath: item.name, location: this.state.location, newLocation: 'trash' }))
		this.moveCopyItem('rename', item, {}, itemArray, [], selected, false, true)
	}

	/* Restore Item from Trash to its original location */
	restoreItem = item => {
		const timeout = setTimeout(() => this.props.setCloudLoading(true), 500)
		Api.cloud.restore(item).then(res => {
			this.props.enqueueSnackbar(res, { variant: 'success' })
			this.fetchCloudStorage()
			clearTimeout(timeout)
			this.props.setCloudLoading(false)
			this.props.reloadCloudTree()
		}).catch(err => {
			this.props.enqueueSnackbar(err, { variant: 'error' })
			clearTimeout(timeout)
			this.props.setCloudLoading(false)
		})
	}

	/* Move or Copy and Item and show a Breadcrumb whith an Undo Button */
	moveCopyItem = (arg1, arg2, arg3, arg4, arg5, selected, overwrite, append) => {
		const eexist = [arg1, arg2, arg3, arg4, arg5, selected]
		const { setCloudLoading, reloadCloudTree, enqueueSnackbar, closeSnackbar } = this.props
		const { fetchCloudStorage } = this
		let timeout = setTimeout(() => setCloudLoading(true), 500)
		if(overwrite) arg2.overwrite = true
		if(append) arg2.append = true
		if(selected.length > 0) {
			arg2 = arg4.map(item => ({ ...item, overwrite, append } ))
			arg3 = arg5
		}
	
		Api.cloud[selected.length > 0 ? `${arg1}Multiple` : arg1](arg2).then(res => {
			const undo = key => {
				closeSnackbar(key)
				const _timeout = setTimeout(() => setCloudLoading(true), 500)
				Api.cloud[`${arg1 === 'copy' ? 'delete' : 'rename'}${selected.length > 0 ? 'Multiple' : ''}`](arg3).then(res => {
					enqueueSnackbar(res, { variant: 'success' })
					fetchCloudStorage()
					clearTimeout(_timeout)
					setCloudLoading(false)
					reloadCloudTree()
				}).catch(err => {
					enqueueSnackbar(err, { variant: 'error' })
					clearTimeout(_timeout)
					setCloudLoading(false)
				})
			}
			enqueueSnackbar(res, { variant: 'success', action: key => !overwrite && !append && arg2.newLocation !== 'trash' && <Button style={{ color:'#fff' }} onClick={() => undo(key)}>Undo</Button> })
			fetchCloudStorage()
			clearTimeout(timeout)
			setCloudLoading(false)
			reloadCloudTree()
		}).catch(err => {
			clearTimeout(timeout)
			setCloudLoading(false)
			const eexistDialogData = { moveCopyItem: this.moveCopyItem, eexist }
			if(err === 'EEXIST') this.setState({ eexistDialog: true, eexistDialogData })
		 	else enqueueSnackbar(err, { variant: 'error' })
		})
	}

	/* Create Download Link */
	createDownloadLink = item => {
		const timeout = setTimeout(() => this.props.setCloudLoading(true), 500)
		Api.cloud.createDownloadKey({ path: item.path, location: this.state.location }).then(res => {
			this.setState({ shareDialog: true, shareDialogData: { link: `https://aspire.icu:97/download?key=${res}` } })
			clearTimeout(timeout)
			this.props.setCloudLoading(false)
		}).catch(err => {
			this.props.enqueueSnackbar(err, { variant: 'error' })
			clearTimeout(timeout)
			this.props.setCloudLoading(false)
		})
	}

	/* Download selected files or lastItem */
	startDownload = item => {
		if(!this.state.selected.length > 0) {
			if(Object.values(this.state.currentTransfers).find(e => e.name === item.name)) return this.props.enqueueSnackbar('Unable to download this File right now', { variant: 'error' })
			const id = Math.random().toString(36).substring(7)
			const data = { location: this.state.location, path: item.path }
			const zip = item.size / 1000000 > 32 && !['.zip', '.rar'].includes(nodePath.extname(item.path).toLowerCase())
			const transfers = this.state.currentTransfers
			transfers[id] = {
				status: zip ? 'Zipping...' : 'Starting...',
				onCancel: () => {},
				type: 'download',
				total: item.size,
				name: item.name,
				progress: 0,
				loaded: 0,
				id: id
			}
			let startTimeStamp = null
			Api.cloud.download(data, (e) => {
				if(!startTimeStamp) startTimeStamp = new Date().getTime()
				const progress = parseInt(Math.round((e.loaded / e.total) * 100))
				const transfers = this.state.currentTransfers
				delete transfers[id]
				const duration = (new Date().getTime() - startTimeStamp) / 1000
				const speed = Math.round(e.loaded / duration)
				if(progress !== 100) {
					transfers[id] = {
						onCancel: () => {},
						progress: progress,
						loaded: e.loaded,
						type: 'download',
						name: item.name,
						total: e.total,
						speed: speed,
						id: id
					}
				}
				this.setState({ currentTransfers: transfers })
			}).then(res => {
				const basename = nodePath.basename(item.path)
				const name = basename.includes('.') && !zip ? basename : `${basename}.zip`
				saveAs(new Blob([res.data]), name)
			}).catch(err => {
				this.props.enqueueSnackbar(err, { variant: 'error' })
			})
		} else {
			const id = Math.random().toString(36).substring(7)
			const items = this.state.selected.map(item => ({ path: item.path, location: this.state.location }))
			items.forEach(item => {
				if(Object.values(this.state.currentTransfers).find(e => e.name === item.name)) return this.props.enqueueSnackbar('Unable to download this File right now', { variant: 'error' })
			})
			const zip = item.size / 1000000 > 32
			const transfers = this.state.currentTransfers
			transfers[id] = {
				status: zip ? 'Zipping...' : 'Starting...',
				onCancel: () => axios.abort(id),
				name: 'Download.zip',
				type: 'download',
				progress: 0,
				total: '?',
				loaded: 0,
				id: id
			}
			let startTimeStamp = null
			Api.cloud.downloadMultiple(items, (e) => {
				if(!startTimeStamp) startTimeStamp = new Date().getTime()
				const progress = parseInt(Math.round((e.loaded / e.total) * 100))
				const transfers = this.state.currentTransfers
				delete transfers[id]
				const duration = (new Date().getTime() - startTimeStamp) / 1000
				const speed = Math.round(e.loaded / duration)
				if(progress !== 100) {
					transfers[id] = {
						name: item.name,
						progress: progress,
						type: 'download',
						loaded: e.loaded,
						total: e.total,
						speed: speed,
						id: id
					}
				}
				this.setState({ currentTransfers: transfers })
			}).then(res => {
				saveAs(new Blob([res]), 'Download.zip')
			}).catch(err => {
				this.props.enqueueSnackbar(err, { variant: 'error' })
			})
		}
	}

	/* Open Image Viewer */
	viewImage = item => {
		const timeout = setTimeout(() => this.props.setCloudLoading(true), 500)
		item.location = this.state.location
		Api.cloud.getImageData(item).then(res => {
			clearTimeout(timeout)
			this.props.setCloudLoading(false)
			this.setState({ imageViewer: true, imageViewerData: { src: res, width: this.props.width } })
		}).catch(err => {
			clearTimeout(timeout)
			this.props.setCloudLoading(false)
			this.props.enqueueSnackbar(err, { variant: 'error' })
		})
	}

	/* Open Text Editor */
	openTextEditor = item => {
		if(item.size / 1000000 > 0.025) return this.props.enqueueSnackbar('The File is too big', { variant: 'error' })
		const timeout = setTimeout(() => this.props.setCloudLoading(true), 500)
		item.location = this.state.location
		Api.cloud.getTextFile(item).then(res => {
			clearTimeout(timeout)
			this.props.setCloudLoading(false)
			this.setState({ textEditor: true, textEditorData: { ...item, text: res } })
		}).catch(err => {
			clearTimeout(timeout)
			this.props.setCloudLoading(false)
			this.props.enqueueSnackbar(err, { variant: 'error' })
		})
	}

	/* Open Dialog depending on Item type after double-clicking a File Card */
	onDoubleClick = item => {
		const ext = nodePath.extname(item.name).replace('.', '').toLowerCase()
		if(['jpg', 'jpeg', 'jfif', 'png', 'webm', 'gif'].includes(ext)) this.viewImage(item)
		else if (textExtensions.includes(ext)) this.openTextEditor(item)
	}

	/* Open Context Menu */
	openMenu = (item, e) => {
		this.setState({
			anchorEl: e.currentTarget,
			lastItem: item
		})
	}

	/* Handle Right Click on root div */
	handleRootClick = e => {
		e.preventDefault()
		if(this.menuOpen) return
		this.setState({
			cursorX: e.clientX - 2,
			cursorY: e.clientY - 4,
			rootMenu: true
		})
	}

	/* Handle Right Click on Grid Item */
	handleClick = (e, item) => {
		e.preventDefault()
		/* Can't set this with state, setState will take too long to update and handleRootClick will execute */
		this.menuOpen = true
		this.setState({
			cursorX: e.clientX - 2,
			cursorY: e.clientY - 4,
			lastItem: item,
			rootMenu: false
		})
	}

	/* Handle Menu Close */
	handleClose = e => {
		let state = { anchorEl: null, subAnchorEl: null, cursorX: null, cursorY: null }
		const { lastItem } = this.state
		if(e?.target) {
			switch(e.target.getAttribute('value')) {
				case 'Rename':
					state['renameDialog'] = true
					state['renameDialogData'] = {
						item: lastItem,
						location: this.state.location,
						moveCopyItem: this.moveCopyItem
					}
					break
				case 'Edit':
					this.openTextEditor(lastItem)
					break
				case 'View':
					this.viewImage(lastItem)
					break
				case 'Share':
					this.createDownloadLink(lastItem)
					break
				case 'Download':
					this.startDownload(lastItem)
					break
				case 'Move':
					this.action = 'rename'
					state['treeDialog'] = true
					state['treeDialogData'] = { moveItem: this.moveItem }
					break
				case 'Copy':
					this.action = 'copy'
					state['treeDialog'] = true
					state['treeDialogData'] = { moveItem: this.moveItem }
					break
				case 'Remove':
					this.moveToTrash()
					break
				case 'Restore':
					this.restoreItem(lastItem)
					break
				case 'Delete':
					state['deleteDialog'] = true
					state['deleteDialogData'] = {
						update: this.fetchCloudStorage,
						selected: this.state.selected,
						location: this.state.location,
						item: lastItem
					}
					break
				case 'Refresh':
					this.fetchCloudStorage()
					break
				case 'New Folder':
					state['createDialog'] = true
					state['createDialogData'] = {
						update: this.fetchCloudStorage,
						location: this.state.location
					}
					break
				case 'Upload Files':
					break
				default: break
			}
		}
		/* Refer to comment in handleClick to understand why this is necessary */
		this.menuOpen = false
		this.setState(state)
	}

	/* Tab Navigation */
	handleTabChange = (e, value) => { 
		this.setState({ tabValue: value })
		this.props.history.push(`/cloud/${value === 0 ? 'shared' : value === 1 ? 'u' : 'trash'}/`)
		this.fetchCloudStorage()
	}

	/* Set the path name */
	setPath = name => {
		const path = `${document.location.pathname}/${name}`.split('//').join('/')
		this.props.history.push(path)
		this.fetchCloudStorage()
	}
}

const styles = theme => ({
	root: {
		padding: theme.spacing(2),
		minHeight: '100vh',
		width: '100%',
		flexGrow: 1
	},
	gridContainer: {
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
	},
	typography: {
		margin: theme.spacing(2, 0, 0, 0.5),
		userSelect: 'none'
	},
	menuIcon: {
		marginLeft: -theme.spacing(1),
		marginRight: theme.spacing(1),
		pointerEvents: 'none'
	},
	h4Typography: {
		margin: theme.spacing(2, 0, 0, 2)
	},
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff'
	}
})

const mapStateToProps = state => ({
	searchInput: state.generic.searchInput,
	cloudLoading: state.cloud.loading
})
const mapDispatchToProps = dispatch => ({
	setCloudLoading: value => dispatch(setCloudLoading(value)),
	reloadCloudTree: () => dispatch(reloadCloudTree())
})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withRouter(withSnackbar(withWidth()(Cloud)))))