import { Fab, Hidden, makeStyles } from '@material-ui/core'
import { Add, DeleteForever } from '@material-ui/icons'

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

export default function InboxFab(props) {
	const { location, setState } = props.data
	const classes = useStyles()
	return (
		location === 'trash' ? (<>
			<Hidden xsDown>
				<Fab onClick={() => {}} className={classes.fab} color='primary' variant='extended'>
					<DeleteForever />
					Clear Trash
				</Fab>
			</Hidden>
			<Hidden smUp>
				<Fab onClick={() => {}} className={classes.fab} color='primary'>
					<DeleteForever />
				</Fab>
			</Hidden>
		</>):(<>
			<Hidden xsDown>
				<Fab onClick={() => setState({ composeDialog: true })} className={classes.fab} color='primary' variant='extended'>
					<Add className={classes.extendedIcon} />
					Compose
				</Fab>
			</Hidden>
			<Hidden smUp>
				<Fab onClick={() => setState({ composeDialog: true })} className={classes.fab} color='primary'>
					<Add />
				</Fab>
			</Hidden>
		</>)
	)
}