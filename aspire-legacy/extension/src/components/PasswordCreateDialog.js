import { Button, Dialog, DialogActions, DialogContent, LinearProgress, Typography, withStyles } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'
import TextField from './TextField'
import Api from '../Api'

class PasswordCreateDialoge extends Component {
	render() {
		const { validateForm, onSubmit, handleClose } = this
		const { classes, open } = this.props

		return (
			<Dialog open={open} onClose={handleClose}>
				<DialogContent className={classes.dialogeContent}>
					<Typography component='h1' variant='h5'>Create Account</Typography>
					<Formik initialValues={{ site: '', username: '', email: '', password: '' }} validate={validateForm} onSubmit={onSubmit}>
						{({ submitForm, isSubmitting }) => (
							<Form autoComplete='off'>
								<Field
									component={TextField}
									variant='outlined'
									margin='normal'
									fullWidth
									required
									name='site'
									label='Site'
								/>
								<Field
									component={TextField}
									variant='outlined'
									margin='normal'
									fullWidth
									required
									name='username'
									label='Username'
								/>
								<Field
									component={TextField}
									variant='outlined'
									margin='normal'
									fullWidth
									name='email'
									label='Email'
								/>
								<Field
									component={TextField}
									variant='outlined'
									margin='normal'
									fullWidth
									required
									passwordGen='true'
									password='true'
									strength='true'
									name='password'
									label='Password'
								/>
								{isSubmitting && <LinearProgress /> }
								<DialogActions>
									<Button onClick={handleClose} color='primary'>Cancel</Button>
									<Button type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Create</Button>
								</DialogActions>
							</Form>
						)}
					</Formik>
				</DialogContent>
			</Dialog>
		)
	}

	validateForm = values => {
		const errors = {}
		if(!values.site) errors.site = 'Required'
		if(!values.username) errors.username = 'Required'
		if(!values.password) errors.password = 'Required'
		if(values.site.length > 128) errors.site = 'Too long'
		if(values.username.length > 128) errors.username = 'Too long'
		if(values.email.length > 128) errors.email = 'Too long'
		if(values.password.length > 256) errors.password = 'Too long'
		return errors
	}

	onSubmit = (values, { setSubmitting }) => {
		const { enqueueSnackbar, fetchPasswords } = this.props
		setTimeout(() => {
			Api.passwords.create(values).then(res => {
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
	dialogeContent: {
		padding: theme.spacing(2),
		flexDirection: 'column',
		alignItems: 'center',
		display: 'flex'
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(PasswordCreateDialoge))