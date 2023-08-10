import { withStyles } from '@material-ui/core'
import React, { Component } from 'react'
import Channel from './Channel/Channel'
import Friends from './Friends/Friends'
import { connect } from 'react-redux'

class Chat extends Component {
	render() {
		const { classes, channels } = this.props
		return (
			<div className={classes.root}>
				<div className={classes.spacer} />
				{
					channels.selected === null ?
					(
						<Friends />
					) : (
						<Channel channel_id={channels.selected} channel={channels[channels.selected]} />
					)
				}
			</div>
		)
	}
}

const styles = theme => ({
	root: {
		padding: theme.spacing(2),
		height: '100vh',
		width: '100%',
		flexGrow: 1,
		display: 'flex',
		flexDirection: 'column'
	},
	spacer: {
		...theme.mixins.toolbar
	}
})

const mapStateToProps = state => ({
	channels: state.channels
})
const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(Chat))