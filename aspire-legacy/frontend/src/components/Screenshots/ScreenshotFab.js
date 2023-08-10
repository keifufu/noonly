import { Fab, Hidden, makeStyles, useScrollTrigger } from "@material-ui/core"
import { ExpandLess } from "@material-ui/icons"

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

export default function ScreenshotFab(props) {
    const { window } = props
	const classes = useStyles()
	const trigger = useScrollTrigger({ target: window ? window() : undefined, disableHysteresis: true })

	const scrollBackUp = e => {
		const anchor = (e.target.ownerDocument || document).querySelector('#back-to-top-anchor')
		if(anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
		</>) : (<></>)
	)
}