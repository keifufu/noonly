import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { useMediaQuery } from '@material-ui/core'
import { useLocation } from 'react-router'
import { connect } from 'react-redux'

import hasBottomNavigation from 'library/utilities/hasBottomNavigation'
import Notification from 'library/components/Notification'
import storage from 'library/utilities/storage'
import './notification.css'

function Notifications({ notifications, sidebar }) {
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))
	const location = useLocation()
	const style = {
		position: 'fixed',
		zIndex: 9999999,
		bottom: 16 + (hasBottomNavigation(location.pathname, isMobile) && 8 * 7),
		left: sidebar ? 236 : storage.getItem('user', null) && !isMobile ? 72 : 16,
		transition: '0.2s all ease-in-out'
	}

	return (
		<TransitionGroup style={style}>
			{notifications.map((notification) => (
				<CSSTransition
					timeout={250}
					classNames='notification'
					key={notification.id}
				>
					<div style={{ marginTop: 4 }}>
						<Notification {...notification} />
					</div>
				</CSSTransition>
			))}
		</TransitionGroup>
	)
}
const mapState = (state) => ({
	notifications: state.notifications,
	sidebar: state.sidebar
})
const mapDispatch = (dispatch) => ({})
export default connect(mapState, mapDispatch)(Notifications)