import { Tooltip, IconButton as MUIIconButton } from '@material-ui/core'
import { Error } from '@material-ui/icons'

function IconButton(props) {
	const { className, edge, size, tooltip, tooltipLocation, onClick, icon, visible, buttonRef } = props
	const Icon = icon

	let returnValue = null
	if (typeof tooltip === 'string' && tooltip.length > 0) {
		returnValue = (
			<Tooltip title={tooltip} placement={tooltipLocation} enterDelay={500}>
				<MUIIconButton ref={buttonRef} className={className}
					edge={edge} style={{ height: size, width: size }} color='inherit' onClick={onClick}>
					<Icon style={{ pointerEvents: 'none' }} />
				</MUIIconButton>
			</Tooltip>
		)
	} else {
		returnValue = (
			<MUIIconButton ref={buttonRef} className={className} edge={edge} style={{ height: size, width: size }} color='inherit' onClick={onClick}>
				<Icon style={{ pointerEvents: 'none' }} />
			</MUIIconButton>
		)
	}
	if (!visible) return null
	return returnValue
}

IconButton.defaultProps = {
	className: '',
	tooltip: '',
	tooltipLocation: 'bottom',
	edge: false,
	size: 48,
	onClick: () => null,
	icon: Error,
	visible: true
}

export default IconButton