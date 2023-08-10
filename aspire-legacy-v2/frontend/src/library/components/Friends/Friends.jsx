import { Button, Grid, makeStyles, Paper, Tab, Tabs } from '@material-ui/core'
import { connect } from 'react-redux'
import { useState } from 'react'

import applyFriendFilter from 'library/common/filter/applyFriendFilter'
import Friend from 'library/components/Friend'

const useStyles = makeStyles((theme) => ({
	root: {
	},
	gridContainer: {
		maxHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight + 10}px)`,
		overflow: 'scroll'
	},
	toolbar: {
		marginBottom: theme.spacing(1),
		paddingLeft: theme.spacing(1),
		alignItems: 'center',
		display: 'flex',
		height: 48
	}
}))

function Friends({ friends: _friends, openDialog }) {
	const classes = useStyles()
	const [value, setValue] = useState(0)
	const friends = applyFriendFilter(_friends, value)
	// const pendingRequests = Object.values(_friends).filter((e) => e.requestType).length

	const handleChange = (e, value) => setValue(value)

	return (
		<div className={classes.root}>
			<Paper className={classes.toolbar}>
				<Tabs indicatorColor='primary' value={value} onChange={handleChange}>
					<Tab label='Online' />
					<Tab label='All' />
					{/* <Badge color='primary' badgeContent={pendingRequests}> */}
					<Tab label='Pending' />
					{/* </Badge> */}
					<Tab label='Blocked' />
				</Tabs>
				<Button
					onClick={() => {
						openDialog({
							id: 16
						})
					}}
					color='primary'
					variant='contained'
				>
					Add Friend
				</Button>
			</Paper>
			<Grid container spacing={1} className={classes.gridContainer}>
				{friends.map((friend) => (
					<Grid item xs={12} key={friend.id}>
						<Friend friend={friend} />
					</Grid>
				))}
			</Grid>
		</div>
	)
}

const mapState = (state) => ({
	friends: state.friends
})
const mapDispatch = (dispatch) => ({
	openDialog: dispatch.dialog.open
})
export default connect(mapState, mapDispatch)(Friends)