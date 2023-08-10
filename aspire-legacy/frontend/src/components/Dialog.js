import { Button, Dialog as MUIDialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, withStyles } from '@material-ui/core'
import DraggablePaper from './DraggablePaper'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'
import PropTypes from 'prop-types'
import { Formik } from 'formik'

class Dialog extends Component {
	render() {
		const { onSubmit, handleClose } = this
		const { classes, open, title, text } = this.props

		return (
			<MUIDialog open={open} disableBackdropClick PaperComponent={DraggablePaper} onClose={handleClose}>
                <DialogTitle id='draggable-title'>{title}</DialogTitle>
				<Formik initialValues={{}} onSubmit={onSubmit}>
					{({ submitForm, isSubmitting }) => (<>
						<DialogContent>
							<DialogContentText>
								{text}
							</DialogContentText>
						</DialogContent>
						{isSubmitting && <LinearProgress className={classes.progress} /> }
						<DialogActions>
							<Button onClick={handleClose} color='primary'>Cancel</Button>
							<Button type='submit' onClick={submitForm} color='primary'>Confirm</Button>
						</DialogActions>
					</>)}
				</Formik>
            </MUIDialog>
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

Dialog.propTypes = {
	title: PropTypes.string.isRequired,
	text: PropTypes.string.isRequired,
	open: PropTypes.bool.isRequired,
	onSubmit: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired
}

export default withStyles(styles, { withTheme: true })(withSnackbar(Dialog))