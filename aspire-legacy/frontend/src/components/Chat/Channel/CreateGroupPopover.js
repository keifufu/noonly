import {  Avatar, Button, Checkbox, ClickAwayListener, fade, Input, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Paper, Portal, Typography, withStyles } from '@material-ui/core'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Api from '../../../Api'
import { withSnackbar } from 'notistack'
const clone = require('rfdc')()

class CreateGroupPopover extends Component {
	constructor(props) {
		super(props)
		this.state = {
			selected: [],
			search: ''
		}
	}
	
	render() {
		const { classes, cursors, offset, onClose, friends, selectedChannel } = this.props
		const { selected, search } = this.state
		if(!cursors.y) return null

		const style = {
			position: 'fixed',
			zIndex: 999999,
			top: cursors.y + offset.y,
			left: cursors.x + offset.x
		}

		const visibleFriends = Object.values(friends).filter(friend => {
			if(friend.channel_id === selectedChannel) return false
			if(friend.username.toLowerCase().includes(search.toLowerCase())) return true
			return false
		})

		return (
			<Portal>
			<ClickAwayListener onClickAway={onClose}>
			<Paper elevation={8} style={style} className={classes.paper}>
				<Typography className={classes.header}>SELECT FRIENDS</Typography>
				<Typography variant='body2' color='textSecondary'>You can add {8 - selected.length} more friends.</Typography>
				<Input
					placeholder='Type the username of a friend'
					disableUnderline
					className={classes.input}
					value={search}
					onChange={e => this.setState({ search: e.target.value })}
				/>
				<List dense className={classes.list}>
					{visibleFriends.map((friend, index) => (
						<ListItem key={index}>
							<ListItemAvatar>
								<Avatar src={friend.avatar} />
							</ListItemAvatar>
							<ListItemText primaryTypographyProps={{ style: { fontWeight: '550' } }} primary={friend.username} />
							<ListItemSecondaryAction>
								<Checkbox
									color='primary'
									edge='end'
									onChange={() => this.toggleUser(friend)}
									checked={selected.includes(friend.id)}
								/>
							</ListItemSecondaryAction>
						</ListItem>
					))}
				</List>
				<Button onClick={this.onSubmit} disabled={selected.length === 0} color='primary' variant='contained' fullWidth>Create Group DM</Button>
			</Paper>
			</ClickAwayListener>
			</Portal>
		)
	}

	toggleUser = user => {
		const state = clone(this.state)
		if(state.selected.includes(user.id)) {
			state.selected.splice(state.selected.indexOf(user.id), 1)
		} else {
			if(state.selected.length === 8) return
			state.selected.push(user.id)
		}
		this.setState(state)
	}

	onSubmit = () => {
		const { selected } = this.state
		Api.groups.create(selected).then(res => {
			/* res will probably be the created group */
		}).catch(err => {
			this.props.enqueueSnackbar(err, { variant: 'error' })
		})
	}
}

CreateGroupPopover.propTypes = {
	cursors: PropTypes.shape({
		x: PropTypes.number,
		y: PropTypes.number
	}),
	offset: PropTypes.shape({
		x: PropTypes.number,
		y: PropTypes.number
	}),
	onClose: PropTypes.func
}

CreateGroupPopover.defaultProps = {
	cursors: { x: null, y: null },
	offset: { x: 0, y: 0 },
	onClose: () => null,
}

const styles = theme => ({
	paper: {
		padding: theme.spacing(2),
		width: 350,
	},
	input: {
		width: '100%',
		backgroundColor: fade(theme.palette.common.black, 0.2),
		borderRadius: 4,
		padding: theme.spacing(0.3),
		paddingLeft: theme.spacing(1),
		marginTop: theme.spacing(0.3)
	},
	list: {
		backgroundColor: fade(theme.palette.common.black, 0.1),
		borderRadius: 8,
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(2),
		height: 250,
		overflow: 'scroll'
	},
	header: {
		fontWeight: 'bold'
	}
})

const mapStateToProps = state => ({
	friends: state.friends,
	selectedChannel: state.channels.selected
})
const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(withSnackbar(CreateGroupPopover)))