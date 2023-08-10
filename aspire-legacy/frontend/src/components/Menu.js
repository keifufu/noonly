import { ClickAwayListener, MenuItem, MenuList, Paper, Portal, withStyles } from '@material-ui/core'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Menu extends Component {
	render() {
		const { classes, cursors, items, offset, onClose } = this.props
		if(!cursors.y) return null

		const style = {
			position: 'fixed',
			zIndex: 999999,
			top: cursors.y + offset.y,
			left: cursors.x + offset.x
		}

		return (
			<Portal>
			<ClickAwayListener onClickAway={onClose}>
			<Paper elevation={8} style={style}>
				<MenuList>
					{items.map((item, index) => {
						if(this.isItemVisible(item)) {
							const Icon = item.icon
							return (
								<MenuItem onClick={() => this.onItemClick(item)} key={index}>
									<Icon color='primary' className={classes.icon} />
									{item.name}
								</MenuItem>
							)
						} else return null
					})}
				</MenuList>
			</Paper>
			</ClickAwayListener>
			</Portal>
		)
	}

	isItemVisible = item => {
		if(typeof item.visible === 'boolean') return item.visible
		if(typeof item.visible === 'function') return item.visible()
		return true
	}

	onItemClick = item => {
		this.props.onClose()
		item.onClick()
	}
}

const styles = theme => ({
	icon: {
		marginLeft: -theme.spacing(1),
		marginRight: theme.spacing(1),
		pointerEvents: 'none'
	}
})

Menu.propTypes = {
	cursors: PropTypes.shape({
		x: PropTypes.number,
		y: PropTypes.number
	}),
	items: PropTypes.array,
	offset: PropTypes.shape({
		x: PropTypes.number,
		y: PropTypes.number
	}),
	onClose: PropTypes.func
}

Menu.defaultProps = {
	cursors: { x: null, y: null },
	items: [],
	offset: { x: 0, y: 0 },
	onClose: () => null,
}

export default withStyles(styles, { withTheme: true })(Menu)