import { Fab as MuiFab, Hidden, makeStyles, useMediaQuery } from '@material-ui/core'
import { useLocation } from 'react-router'
import { Error } from '@material-ui/icons'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import hasBottomNavigation from 'library/utilities/hasBottomNavigation'

const useStyles = makeStyles((theme) => ({
	fab: {
		position: 'fixed',
		bottom: theme.spacing(4),
		right: theme.spacing(4),
		[theme.breakpoints.down('xs')]: {
			bottom: (props) => (theme.spacing(3 + (props.notifications.length * 7) + (props.hasBottomNavigation && 7))),
			right: theme.spacing(3)
		},
		zIndex: 99999999,
		transition: '0.2s all ease-in-out'
	},
	extendedIcon: {
		marginRight: theme.spacing(1)
	}
}))

function Fab(props) {
	const { icon, onClick, text, notifications } = props
	const location = useLocation()
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))
	const classes = useStyles({ notifications, hasBottomNavigation: hasBottomNavigation(location.pathname, isMobile) })
	const Icon = icon

	return (<>
		<Hidden xsDown>
			<MuiFab onClick={onClick} className={classes.fab} color='primary' variant='extended'>
				<Icon className={classes.extendedIcon} />
				{text}
			</MuiFab>
		</Hidden>
		<Hidden smUp>
			<MuiFab onClick={onClick} className={classes.fab} color='primary'>
				<Icon />
			</MuiFab>
		</Hidden>
	</>)
}

Fab.propTypes = {
	icon: PropTypes.any,
	onClick: PropTypes.func,
	text: PropTypes.string
}

Fab.defaultProps = {
	icon: Error,
	onClick: () => null,
	text: ''
}

const mapState = (state) => ({
	notifications: state.notifications
})
const mapDispatch = (dispatch) => ({})
export default connect(mapState, mapDispatch)(Fab)