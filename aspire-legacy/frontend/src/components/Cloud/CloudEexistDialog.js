import { Button, Dialog, DialogActions, DialogTitle, withStyles } from '@material-ui/core'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'

class CloudEexistDialog extends Component {
	render() {
		const { onOverwrite, onAppend, handleClose } = this
		const { classes, open, data } = this.props

		return (
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>{data.upload ? data.upload.name : 'File'} already exists</DialogTitle>
				<DialogActions className={classes.dialog}>
					<Button onClick={handleClose} color='primary'>Cancel</Button>
					<Button onClick={onOverwrite} color='primary'>Overwrite</Button>
					<Button onClick={onAppend} color='primary'>Append</Button>
				</DialogActions>
			</Dialog>
		)
	}

	onOverwrite = () => {
		const { data } = this.props
		const { moveCopyItem, eexist, upload } = data 
		upload ? upload.exec('overwrite') :
		moveCopyItem(...eexist, true)
		this.handleClose()
	}

	onAppend = () => {
		const { data } = this.props
		const { moveCopyItem, eexist, upload } = data 
		upload ? upload.exec('append') :
		moveCopyItem(...eexist, false, true)
		this.handleClose()
	}

	handleClose = () => this.props.onClose()
}

const styles = theme => ({
	dialog: {
		width: 300
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(CloudEexistDialog))