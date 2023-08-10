import { BottomNavigation, BottomNavigationAction, Grid, Hidden, makeStyles, Typography, useMediaQuery } from '@material-ui/core'
import { CloudCircle, Delete, ShareRounded } from '@material-ui/icons'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useHistory, useLocation } from 'react-router'
import withScrolling from 'react-dnd-scrolling'
import { DndProvider } from 'react-dnd'
import LazyLoad from 'react-lazyload'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'

import CloudDragLayer from 'library/components/CloudDragLayer/CloudDragLayer'
import CloudDropzone from 'library/components/CloudDropzone/CloudDropzone'
import applyCloudSearch from 'library/common/search/applyCloudSearch'
import applyCloudFilter from 'library/common/filter/applyCloudFilter'
import applyCloudSort from 'library/common/sort/applyCloudSort'
import CloudFile from 'library/components/CloudFile/CloudFile'
import CloudFab from 'library/components/CloudFab/CloudFab'
import CenteredText from 'library/components/CenteredText'
import CloudToolbar from 'library/components/CloudToolbar'
import CloudFolder from 'library/components/CloudFolder'

const ScrollingComponent = withScrolling('div')

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(2),
		height: `calc(100vh - ${theme.mixins.toolbar.minHeight + 10}px)`,
		overflow: 'scroll'
	},
	typography: {
		margin: theme.spacing(2, 0, 0, 0.5),
		userSelect: 'none'
	},
	stickToBottom: {
		position: 'fixed',
		zIndex: 99999,
		width: '100%',
		bottom: 0
	},
	bottomNavigationSpacer: {
		height: 50
	}
}))

function Cloud({ cloud, selection, sort, searchInput, openContextMenu }) {
	const classes = useStyles()
	const location = useLocation()
	const history = useHistory()
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))

	let currentParentId = location.pathname.replace('/cloud/trash', '').replace('/cloud', '')
	if (currentParentId.startsWith('/'))
		currentParentId = currentParentId.substring(1)
	if (currentParentId.length === 0)
		currentParentId = null

	const displayTrash = location.pathname.startsWith('/cloud/trash')
	const files = applyCloudSort(applyCloudSearch(applyCloudFilter(cloud, 'file', currentParentId, displayTrash), searchInput), sort)
	const folders = applyCloudSort(applyCloudSearch(applyCloudFilter(cloud, 'folder', currentParentId, displayTrash), searchInput), sort)
	const tabValue = displayTrash ? 2 : 0

	if (currentParentId !== null && !cloud[currentParentId])
		history.push('/cloud')

	const onContextMenu = (e) => {
		setTimeout(() => {
			if (window.fuckoff) return
			openContextMenu({
				id: 6,
				cursors: {
					x: e.clientX,
					y: e.clientY
				},
				item: currentParentId
			})
		}, 50)
	}

	const onTabChange = (e, value) => {
		const location = value === 0 ? 'cloud' : value === 1 ? 'cloud/shared' : 'cloud/trash'
		history.push(location)
	}

	return (<>
		<Helmet>
			<title>Cloud - Aspire</title>
		</Helmet>
		<DndProvider backend={HTML5Backend} options={{ delayTouchStart: 100 }}>
			<CloudDropzone currentParentId={currentParentId}>
				<ScrollingComponent
					className={classes.root}
					onContextMenu={onContextMenu}
				>
					<CloudToolbar currentParentId={currentParentId} />
					{
						folders.length === 0 && files.length === 0 && displayTrash && searchInput.length === 0
						&& (isMobile
							? <CenteredText text='Your Trash is empty!' />
							: <CenteredText text='Your Trash is empty!\nOnce you delete your Files you will find them in here!' />)
					}
					{
						folders.length === 0 && files.length === 0 && !displayTrash && currentParentId === null && searchInput.length === 0
						&& (isMobile
							? <CenteredText text='Your Cloud is empty!' />
							: <CenteredText text='Your Cloud is empty!\nYou can upload some Files via the Upload Button!' />)
					}
					{
						folders.length === 0 && files.length === 0 && !displayTrash && currentParentId !== null && searchInput.length === 0
						&& <CenteredText text='This Folder is empty!' />
					}
					{
						folders.length === 0 && files.length === 0 && searchInput.length > 0
						&& <CenteredText text='No search results found' />
					}
					{folders.length > 0 && (<>
						<Typography className={classes.typography}>Folders</Typography>
						<Grid container spacing={1}>
							{folders.map((item) => (
								<Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
									<LazyLoad>
										<CloudFolder
											folder={item}
											currentParentId={currentParentId}
										/>
									</LazyLoad>
								</Grid>
							))}
						</Grid>
					</>)}
					{files.length > 0 && (<>
						<Typography className={classes.typography}>Files</Typography>
						<Grid container spacing={1}>
							{files.map((item) => (
								<Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
									<LazyLoad>
										<CloudFile
											file={item}
											isSelected={selection.includes(item.id)}
										/>
									</LazyLoad>
								</Grid>
							))}
						</Grid>
					</>)}
					<CloudDragLayer />
				</ScrollingComponent>
			</CloudDropzone>
			<CloudFab currentParentId={currentParentId} />
		</DndProvider>
		<Hidden smUp>
			<div className={classes.bottomNavigationSpacer} />
			<BottomNavigation showLabels value={tabValue} onChange={onTabChange} className={classes.stickToBottom}>
				<BottomNavigationAction label='Cloud' icon={<CloudCircle />} />
				<BottomNavigationAction label='Shared' icon={<ShareRounded />} />
				<BottomNavigationAction label='Trash' icon={<Delete />} />
			</BottomNavigation>
		</Hidden>
	</>)
}

const mapState = (state) => ({
	cloud: state.cloud,
	searchInput: state.searchInput,
	sort: state.sort.cloud,
	selection: state.selection.cloud
})
const mapDispatch = (dispatch) => ({
	openContextMenu: dispatch.contextMenu.open
})
export default connect(mapState, mapDispatch)(Cloud)