import { Dialog, DialogContent, DialogContentText, DialogTitle, Typography, withStyles } from '@material-ui/core'
import { humanFileSize } from '../../Utilities'
import React, { Component } from 'react'
import moment from 'moment'

class ScreenshotDetailsDialog extends Component {
	render() {
		const { classes, open, handleClose, data } = this.props
		const { name, type, width, height, size, created, favorite, trash } = data

		const information = 
		`	Name: ${name}
			Type: ${type}
			Dimensions: ${width}px x ${height}px
			Size: ${humanFileSize(size)}
			Created: ${moment.unix(created).format('MMM DD[,] YYYY [at] hh:mm')}
			Favorite: ${favorite === 'true'}
			Trash: ${trash === 'true'}
		`
		return (
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle className={classes.title}>Screenshot Details</DialogTitle>
				<DialogContent>
					<DialogContentText>
						<Typography style={{ whiteSpace: 'pre-line' }}>
							{information}
						</Typography>
					</DialogContentText>
				</DialogContent>
			</Dialog>
		)
	}
}

const styles = theme => ({
	title: {
		paddingBottom: 0,
		marginBottom: 0
	}
})

export default withStyles(styles, { withTheme: true })(ScreenshotDetailsDialog)