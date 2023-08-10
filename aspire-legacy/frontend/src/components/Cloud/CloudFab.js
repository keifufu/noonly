import { Fab, Hidden, makeStyles, useScrollTrigger } from '@material-ui/core'
import { DeleteForever, ExpandLess, Publish } from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import Api from '../../Api'

const useStyles = makeStyles(theme => ({
	fab: {
		position: 'fixed',
		bottom: theme.spacing(4),
		right: theme.spacing(4),
		[theme.breakpoints.down('xs')]: {
			marginBottom: theme.spacing(6),
			bottom: theme.spacing(3),
			right: theme.spacing(2)
		}
	},
	extendedIcon: {
		marginRight: theme.spacing(1),
	}
}))

export default function CloudFab(props) {
	const { location, setState, getState, update } = props.data
	const { window } = props
	const { enqueueSnackbar } = useSnackbar()
	const classes = useStyles()
	const trigger = useScrollTrigger({ target: window ? window() : undefined, disableHysteresis: true })

	const scrollBackUp = e => {
		const anchor = (e.target.ownerDocument || document).querySelector('#back-to-top-anchor')
		if(anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
	}

	const clearTrash = () => {
		setState({ deleteDialog: true, update, deleteDialogData: { all: true } })
	}

	return (
		trigger ? (<>
			<Hidden xsDown>
				<Fab onClick={scrollBackUp} className={classes.fab} color='primary' variant='extended'>
					<ExpandLess className={classes.extendedIcon} />
					Scroll to top
				</Fab>
			</Hidden>
			<Hidden smUp>
				<Fab onClick={scrollBackUp} className={classes.fab} color='primary'>
					<ExpandLess />
				</Fab>
			</Hidden>
		</>) : (
			location === 'trash' ? (<>
				<Hidden xsDown>
					<Fab onClick={clearTrash} className={classes.fab} color='primary' variant='extended'>
						<DeleteForever />
						Clear Trash
					</Fab>
				</Hidden>
				<Hidden smUp>
					<Fab onClick={clearTrash} className={classes.fab} color='primary'>
						<DeleteForever />
					</Fab>
				</Hidden>
			</>):(<>
				<input
					style={{ display: 'none' }}
					onChange={({ target }) => {
						Object.values(target.files).forEach(file => {
							const state = getState()
							if(Object.values(state.currentTransfers).find(e => e.name === file.name)) return enqueueSnackbar('File already uploading', { variant: 'error' })
							const upload = type => {
								const formData = new FormData()
								formData.append('type', type)
								formData.append('file', file)
								formData.append('location', location)
								const pathname = decodeURIComponent(document.location.pathname)
								let path = pathname.replace(`/cloud/${location === 'user' ? 'u' : location}`, '')
								if(!path.startsWith('/')) path = `/${path}`
								if(path !== '/' && path.endsWith('/')) path = path.slice(0, -1)
								path += `/${file.name}`
								formData.append('path', path)

								const id = Math.random().toString(36).substring(7)
								const transfers = state.currentTransfers
								transfers[id] = {
									status: 'Starting...',
									onCancel: () => {},
									total: file.size,
									name: file.name,
									type: 'upload',
									progress: 0,
									loaded: 0,
									id: id
								}
								let startTimeStamp = null
								Api.cloud.upload(formData, (e) => {
									if(!startTimeStamp) startTimeStamp = new Date().getTime()
									const progress = parseInt(Math.round((e.loaded / e.total) * 100))
									const transfers = state.currentTransfers
									delete transfers[id]
									const duration = (new Date().getTime() - startTimeStamp) / 1000
									const speed = Math.round(e.loaded / duration)
									if(progress !== 100) {
										transfers[id] = {
											progress: progress,
											loaded: e.loaded,
											name: file.name,
											type: 'upload',
											total: e.total,
											speed: speed,
											id: id
										}
									}
									setState({ currentTransfers: transfers })
								}).then(res => {
									update()
								}).catch(err => {
									enqueueSnackbar(err, { variant: 'error' })
								})
							}
							if(state.currentData.files.find(e => e.name === file.name)) {
								setState({ eexistDialog: true, eexistDialogData: {
									upload: {
										name: file.name,
										exec: upload
									}
								} })
							} else upload()
							/* onChange is not executed if the same file gets picked twice */
						})
					}}
					id='file-button'
					multiple
					type='file'
				/>
				<Hidden xsDown>
					<label htmlFor='file-button'>
						<Fab htmlFor='file-button' className={classes.fab} color='primary' variant='extended' component='span' >
							<Publish className={classes.extendedIcon} />
							Upload Files
						</Fab>
					</label>
				</Hidden>
				<Hidden smUp>
					<label htmlFor='file-button'>
						<Fab className={classes.fab} color='primary' component='span' >
							<Publish />
						</Fab>
					</label>
				</Hidden>
			</>)
		)
	)
}