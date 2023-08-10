import { Avatar, Card, CardActionArea, CardHeader, IconButton, withStyles } from '@material-ui/core'
import { MoreVert } from '@material-ui/icons'
import React, { Component } from 'react'

class PasswordCard extends Component {
	render() {
		const { classes, openMenu, openIconDialog, item, onContextMenu, onDoubleClick } = this.props
		const { account_username, site, username, email, icon } = item
		const iconURL = `https://aspire.icu/ss/${account_username}/icons/${icon}`

		return (
			<Card onDoubleClick={onDoubleClick} onContextMenu={onContextMenu}>
				<CardActionArea>
					<CardHeader
						classes={{ action: classes.action }}
						avatar={
							<IconButton className={classes.avatarButton} onClick={() => openIconDialog(item)}>
								<Avatar className={classes.avatar} src={icon === 'null' ? `https://microservice.ninja/faviconCache/?d=${site}` : iconURL}>
									{site[0].toUpperCase()}
								</Avatar>
							</IconButton>
						}
						action={
							<IconButton onClick={e => openMenu(item, e)}>
								<MoreVert />
							</IconButton>
						}
						title={site}
						subheader={`${email && username ? `${email} - ${username}` : email ? email : username}`}
					/>
				</CardActionArea>
			</Card>
		)
	}
}

const styles = theme => ({
	avatarButton: {
		padding: 0
	},
	action: {
		marginTop: -4,
		marginBottom: -8
	}
})

export default withStyles(styles, { withTheme: true })(PasswordCard)