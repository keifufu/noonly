import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, withStyles } from '@material-ui/core'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'
import { Formik } from 'formik'
import Api from '../Api'

class PasswordDeleteDialoge extends Component {
	render() {
		const { onSubmit, handleClose } = this
		const { classes, open } = this.props

		return (
			<Dialog open={open} onClose={handleClose}>
                <DialogTitle>Are you sure?</DialogTitle>
				<Formik initialValues={{}} onSubmit={onSubmit}>
					{({ submitForm, isSubmitting }) => (<>
						<DialogContent>
							<DialogContentText>
								You will not be able to recover deleted passwords.
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
		const { fetchPasswords, enqueueSnackbar } = this.props
		setTimeout(() => {
			Api.passwords.delete(this.props.password).then(res => {
				this.handleClose()
				enqueueSnackbar(res, { variant: 'success' })
				fetchPasswords()
			}).catch(err => {
				setSubmitting(false)
				enqueueSnackbar(err, { variant: 'error' })
			})
		}, 1500)
	}

	handleClose = () => { this.props.onClose() }
}

const styles = theme => ({
	progress: {
		marginTop: -theme.spacing(1),
		alignSelf: 'center',
		width: '90%'
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(PasswordDeleteDialoge))