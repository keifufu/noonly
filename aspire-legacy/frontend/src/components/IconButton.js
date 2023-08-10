import { Tooltip, IconButton as MUIIconButton } from '@material-ui/core'
import { Error } from '@material-ui/icons'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

class IconButton extends Component {
	render() {
		const { tooltip, edge, size, tooltipLocation, onClick, icon, visible } = this.props
		const Icon = icon

		let returnValue = null
		if(typeof tooltip === 'string' && tooltip.length > 0) {
			returnValue = (
				<Tooltip title={tooltip} placement={tooltipLocation} enterDelay={500}>
					<MUIIconButton edge={edge} style={{ height: size, width: size }} color='inherit' onClick={onClick}>
						<Icon />
					</MUIIconButton>
				</Tooltip>
			)
		} else {
			returnValue = (
				<MUIIconButton edge={edge} style={{ height: size, width: size }}  color='inherit' onClick={onClick}>
					<Icon />
				</MUIIconButton>
			)
		}
		
		if(!visible) return null
		return returnValue
	}
}

IconButton.propTypes = {
	tooltip: PropTypes.string,
	tooltipLocation: PropTypes.oneOf([
		'bottom-end',
		'bottom-start',
		'bottom',
		'left-end',
		'left-start',
		'left',
		'right-end',
		'right-start',
		'right',
		'top-end',
		'top-start',
		'top'
	]),
	edge: PropTypes.oneOfType([
		PropTypes.oneOf([
			'start',
			'end'
		]),
		PropTypes.bool
	]),
	size: PropTypes.number,
	onClick: PropTypes.func,
	icon: PropTypes.any,
	visible: PropTypes.bool
}

IconButton.defaultProps = {
	tooltip: '',
	tooltipLocation: 'bottom',
	edge: false,
	size: 48,
	onClick: () => {},
	icon: Error,
	visible: true
}

export default IconButton
