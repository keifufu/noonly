import { Avatar, Card, CardActionArea, CardHeader, IconButton, withStyles } from '@material-ui/core'
import { MoreVert } from '@material-ui/icons'
import React, { Component } from 'react'

class PasswordCard extends Component {
	render() {
		const { classes, openMenu, openIconDialog, password, onContextMenu } = this.props
		const { account_username, site, username, email, icon } = password
		const iconURL = `https://aspire.icu/ss/${account_username}/icons/${icon}`

		return (
			<Card onContextMenu={onContextMenu}>
				<CardActionArea>
					<CardHeader
						avatar={
							<IconButton className={classes.avatarButton} onClick={() => openIconDialog(password)}>
								<Avatar className={classes.avatar} src={icon === 'null' ? `https://i.olsh.me/icon?url=${site}&size=32..192..256` : iconURL}>
									{site[0].toUpperCase()}
								</Avatar>
							</IconButton>
						}
						action={
							<IconButton onClick={e => openMenu(password, e)}>
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
	}
})

export default withStyles(styles, { withTheme: true })(PasswordCard)