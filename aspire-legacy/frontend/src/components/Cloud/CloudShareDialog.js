import { Dialog, DialogContent, withStyles, TextField, IconButton, DialogContentText } from '@material-ui/core'
import { FileCopy } from '@material-ui/icons'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import copy from 'clipboard-copy'

class CloudShareDialog extends Component {
	render() {
		const { handleClose, onClick } = this
		const { classes, open, data } = this.props

		return (
			<Dialog open={open} onClose={handleClose}>
			<DialogContent className={classes.dialogeContent}>
				<DialogContentText color='inherit'>This Link will expire in 12 Hours</DialogContentText>
				<TextField
					disabled
					variant='outlined'
					margin='normal'
					fullWidth
					label='Download Link'
					value={data.link}
					InputProps={{
						endAdornment: (
							<IconButton onClick={onClick}>
								{ <FileCopy /> }
							</IconButton>
						)
					}}
				/>
			</DialogContent>
			</Dialog>
		)
	}

	onClick = () => {
		const { enqueueSnackbar, link } = this.props
		copy(link).then(() => {
			enqueueSnackbar('Copied to Clipboard', { variant: 'success' })
		}).catch(() => {
			enqueueSnackbar('Something went wrong', { variant: 'error' })
		})
	}

	handleClose = () => this.props.onClose()
}

const styles = theme => ({
	dialogeContent: {
		padding: theme.spacing(2),
		flexDirection: 'column',
		alignItems: 'center',
		display: 'flex',
		width: 600
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(CloudShareDialog))