import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, withStyles } from '@material-ui/core'
import DraggablePaper from '../DraggablePaper'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'
import { Formik } from 'formik'

class InboxDeleteDialog extends Component {
	render() {
		const { onSubmit, handleClose } = this
		const { classes, open } = this.props

		return (
			<Dialog open={open} disableBackdropClick PaperComponent={DraggablePaper} onClose={handleClose}>
                <DialogTitle id='draggable-title'>Are you sure?</DialogTitle>
				<Formik initialValues={{}} onSubmit={onSubmit}>
					{({ submitForm, isSubmitting }) => (<>
						<DialogContent>
							<DialogContentText>
								You won't be able to recover deleted Items
							</DialogContentText>
						</DialogContent>
						{isSubmitting && <LinearProgress className={classes.progress} /> }
						<DialogActions>
							<Button onClick={handleClose} color='primary'>Cancel</Button>
							<Button type='submit' onClick={submitForm} color='primary'>Confirm</Button>
						</DialogActions>
					</>)}
				</Formik>
            </Dialog>
		)
	}

	onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
            this.props.onSubmit()
            setSubmitting(false)
            this.handleClose()
		}, 250)
	}

	handleClose = () => this.props.onClose()
}

const styles = theme => ({
	progress: {
		marginTop: -theme.spacing(1),
		alignSelf: 'center',
		width: '90%'
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(InboxDeleteDialog))