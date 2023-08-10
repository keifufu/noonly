// import { Avatar, fade, Card, CardHeader, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, withStyles, Button, Paper } from '@material-ui/core'
// import { Add, ExitToApp, Person, Settings } from '@material-ui/icons'
// import React, { Component } from 'react'

// class AccountPopout extends Component {
// 	render() {
// 		const { classes, data } = this.props
// 		const { selectAddress } = this
// 		const { username, addresses: _addresses, selectedAddress } = JSON.parse(localStorage.getItem('user'))
// 		const addresses = _addresses.sort()
// 		return (
// 			<Paper className={classes.paper}>
// 				<Avatar className={classes.avatar} />
// 				<DialogTitle className={classes.title}>{username}</DialogTitle>
// 				<List>
// 					{addresses.map(address => (
// 						<ListItem button onClick={() => selectAddress(address)} className={selectedAddress === address ? classes.selectedMail : ''}>
// 							<ListItemAvatar>
// 								<Avatar>
// 									<Person />
// 								</Avatar>
// 							</ListItemAvatar>
// 							<ListItemText primary={address} />
// 						</ListItem>
// 					))}
// 					<ListItem button /* onClick={addAccount} */>
// 						<ListItemAvatar>
// 							<Avatar>
// 								<Add />
// 							</Avatar>
// 						</ListItemAvatar>
// 						<ListItemText primary='Add address' />
// 					</ListItem>
// 				</List>
// 				<div className={classes.buttons}>
// 					<Button color='primary'>
// 						<Settings />
// 						Settings
// 					</Button>
// 					<Button color='primary'>
// 						<ExitToApp />
// 						Logout
// 					</Button>
// 				</div>
// 			</Paper>
// 		)
// 	}

// 	selectAddress = address => {
// 		let user = JSON.parse(localStorage.getItem('user'))
// 		user.selectedAddress = address
// 		localStorage.setItem('user', JSON.stringify(user))
// 		this.setState({ user })
// 	}
// }

// const styles = theme => ({
// 	paper: {
// 		position: 'fixed',
// 		display: 'flex',
// 		flexDirection: 'column',
// 		top: 100,
// 		right: 100
// 	},
// 	avatar: {
// 		marginTop: theme.spacing(2),
// 		alignSelf: 'center'
// 	},
// 	title: {
// 		alignSelf: 'center'
// 	},
// 	selectedMail: {
// 		backgroundColor: fade(theme.palette.common.white, 0.15),
// 		'&:hover': {
// 			backgroundColor: fade(theme.palette.common.white, 0.25),
// 		}
// 	},
// 	buttons: {
// 		flexDirection: 'column',
// 		margin: theme.spacing(2),
// 		marginTop: 0
// 	}
// })

// export default withStyles(styles, { withTheme: true })(AccountPopout)