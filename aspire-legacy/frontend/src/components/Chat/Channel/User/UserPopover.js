import { Avatar, Badge, ClickAwayListener, Paper, Portal, Typography, withStyles } from '@material-ui/core'
import React, { Component } from 'react'

class UserPopover extends Component {
	render() {
		const { classes, cursors, user, offset, onClose } = this.props
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
			<Paper elevation={8} style={style} className={classes.paper}>
				<Badge
					overlap='circle'
					anchorOrigin={{
						horizontal: 'right',
						vertical: 'bottom'
					}}
					color='primary'
					badgeContent=' '
				>
					<Avatar src={user.avatar} className={classes.avatar} />
				</Badge>
				<Typography variant='body1' className={classes.username}>{user.username}</Typography>
			</Paper>
			</ClickAwayListener>
			</Portal>
		)
	}
}

const styles = theme => ({
	paper: {
		padding: theme.spacing(2)
	},
	avatar: {
		width: 64,
		height: 64
	},
	username: {
		marginTop: theme.spacing(1),
		fontWeight: 'bold'
	}
})

export default withStyles(styles, { withTheme: true })(UserPopover)