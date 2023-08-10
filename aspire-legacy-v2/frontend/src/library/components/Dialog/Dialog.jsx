import { Dialog as MuiDialog, DialogContent, DialogTitle, makeStyles, SwipeableDrawer, useMediaQuery, Divider, useTheme, fade } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import clsx from 'clsx'

import DraggablePaper from 'library/components/DraggablePaper'

const useStyles = makeStyles((theme) => ({
	dialogContent: {
		marginBottom: (props) => props.marginBottom,
		padding: theme.spacing(2),
		paddingTop: 0,
		paddingBottom: 0,
		flexDirection: 'column',
		alignItems: 'center',
		display: 'flex'
	},
	dialogTitle: {
		backgroundColor: fade('#000', 0.25),
		paddingBottom: theme.spacing(1)
	},
	dialog: {
		zIndex: '9999999999 !important'
	}
}))

function Dialog({ children, open, title, width, onClose, contentClass, marginBottom, topSpacing = 1.5 }) {
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))
	const classes = useStyles({ marginBottom, isMobile })
	const dispatch = useDispatch()
	const theme = useTheme()

	const onKeyDown = (e) => {
		if (e.key !== 'Escape') return
		if (typeof onClose === 'function')
			onClose()
		else
			dispatch.dialog.close()
	}

	const contentClassName = clsx(classes.dialogContent, contentClass)
	const content = (<>
		{ title && <DialogTitle className={classes.dialogTitle} id='draggable-title'>{title}</DialogTitle> }
		<Divider style={{
			marginBottom: theme.spacing(topSpacing),
			backgroundColor: theme.palette.primary.main
		}} />
		<DialogContent className={contentClassName}>
			{children}
		</DialogContent>
	</>)


	return isMobile
		? (
			<SwipeableDrawer
				disableSwipeToOpen
				hysteresis={onClose ? 0.52 : 3}
				minFlingVelocity={onClose ? 450 : 1000000}
				style={{ zIndex: 999999999 }}
				open={open}
				onClose={onClose}
				anchor='bottom'
			>
				{content}
			</SwipeableDrawer>
		)
		: (
			<MuiDialog
				open={open}
				className={classes.dialog}
				disableBackdropClick={!onClose}
				PaperComponent={DraggablePaper}
				maxWidth={width}
				fullWidth={!!width}
				onClose={onClose}
				onKeyDown={onKeyDown}
			>
				{content}
			</MuiDialog>
		)
}

export default Dialog