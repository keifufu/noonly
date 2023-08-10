import { Button, Dialog, DialogActions, DialogContent, LinearProgress, Typography, withStyles } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { decrypt } from '../../Utilities'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import TextField from '../TextField'
import Api from '../../Api'

class PasswordNoteDialog extends Component {
	render() {
		const { validateForm, onSubmit, handleClose } = this
        const { classes, open, values } = this.props
		const decrypted = values && decrypt(values.note, JSON.parse(localStorage.getItem('user')).password)

		return (
			<Dialog open={open} onClose={handleClose}>
			<DialogContent className={classes.dialogeContent}>
				<Typography component='h1' variant='h5'>Edit Note</Typography>
				<Formik initialValues={{ ...values, note: decrypted }} validate={validateForm} onSubmit={onSubmit}>
					{({ submitForm, isSubmitting }) => (
					<Form autoComplete='off'>
						<Field
							multiline
							component={TextField}
							variant='outlined'
							margin='normal'
							fullWidth
							name='note'
							label='Note'
						/>
						{isSubmitting && <LinearProgress /> }
						<DialogActions>
							<Button onClick={handleClose} color='primary'>Cancel</Button>
							<Button type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Update</Button>
						</DialogActions>
					</Form>	)}
				</Formik>
			</DialogContent>
			</Dialog>
		)
    }
    
    validateForm = values => {
		const errors = {}
		if(values.note.length > 512) errors.note = 'Note is too long'
        return errors
    }

	onSubmit = (values, { setSubmitting }) => {
		const { update, enqueueSnackbar } = this.props
		setTimeout(() => {
			Api.passwords.setNote(values).then(res => {
				this.handleClose()
				enqueueSnackbar(res, { variant: 'success' })
				update()
			}).catch(err => {
				setSubmitting(false)
				enqueueSnackbar(err, { variant: 'error' })
			})
		}, 500)
	}

	handleClose = () => this.props.onClose()
}

const styles = theme => ({
	dialogeContent: {
		padding: theme.spacing(2),
		flexDirection: 'column',
		alignItems: 'center',
		display: 'flex'
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(PasswordNoteDialog))