import { Card, CardActionArea, CardHeader, IconButton, Tooltip, Typography, withStyles } from '@material-ui/core'
import { getIcoFromName } from '../../Utilities'
import React, { Component } from 'react'
import { GetApp } from '@material-ui/icons'

class InboxAttachment extends Component {
	render() {
		const { classes, data } = this.props
		const { onClick } = this
		const iconURL = getIcoFromName(data.filename)
		return (
			<Card className={classes.card}>
			<CardActionArea>
				<CardHeader
					classes={{ content: classes.content, action: classes.action }}
					avatar={ <img className={classes.avatar} alt='' src={iconURL} /> }
					action={
						<IconButton onClick={onClick}>
							<GetApp />
						</IconButton>
					}
					title={<Tooltip title={data.filename} enterDelay={500}><Typography className={classes.title} variant='body2'>{data.filename}</Typography></Tooltip>}
				/>
			</CardActionArea>
		</Card>
		)
	}

	onClick = () => {
		console.log('pls download attachment')
	}
}

const styles = theme => ({
	card: {
		backgroundColor: theme.palette.blueGrey[theme.palette.type === 'dark' ? '900' : '100'],
		width: '100%'
	},
	avatar: {
		pointerEvents: 'none',
		height: 24,
		width: 24
	},
	title: {
		fontSize: 20,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		marginRight: -theme.spacing(1)
	},
	action: {
		marginBottom: -8,
		marginRight: -8
	},
	content: {
		overflow: 'hidden'
	}
})

export default withStyles(styles, { withTheme: true })(InboxAttachment)
