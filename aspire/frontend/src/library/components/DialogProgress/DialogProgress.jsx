import { LinearProgress, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
	progress: {
		marginTop: theme.spacing(1),
		borderRadius: 4,
		marginLeft: 4,
		width: '98%'
	},
	spacer: {
		height: 12
	}
}))

function DialogProgress({ className, visible }) {
	const classes = useStyles()
	if (!visible) return <div className={classes.spacer} />
	return <LinearProgress className={`${classes.progress} ${className}`} />
}

export default DialogProgress