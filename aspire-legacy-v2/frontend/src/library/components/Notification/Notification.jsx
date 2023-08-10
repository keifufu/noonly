import { Alert, AlertTitle } from '@material-ui/lab'
import { Button, useMediaQuery } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

function Notification(props) {
	const { button, onClick, severity, text, title } = props
	const dispatch = useDispatch()
	const action = button ? <Button onClick={onClick} color='inherit' size='small'>{button}</Button> : <div />
	const mobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))

	return (
		<Alert
			style={{
				transition: '0.2s all ease-in-out',
				width: mobile && 'calc(100vw - 30px)'
			}}
			onMouseOver={() => dispatch.notifications.pauseTimeout(props)}
			onMouseLeave={() => dispatch.notifications.continueTimeout(props)}
			onAuxClick={() => dispatch.notifications._remove(props.id)}
			severity={severity}
			action={action}
			elevation={6}
			variant='filled'
		>
			{ title && <AlertTitle>{title}</AlertTitle>}
			{ text }
		</Alert>
	)
}

Notification.propTypes = {
	button: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.oneOf([null])
	]),
	onClick: PropTypes.func,
	severity: PropTypes.oneOf([
		'success',
		'warning',
		'info',
		'error'
	]),
	text: PropTypes.string,
	title: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.oneOf([null])
	])
}

Notification.defaultProps = {
	button: null,
	onClick: () => null,
	severity: 'warning',
	text: 'This notification has no text.',
	title: null
}

export default Notification