import { Button, Dialog, DialogActions, DialogContent, LinearProgress, Typography, withStyles } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { decrypt } from '../../Utilities'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import TextField from '../TextField'
import Api from '../../Api'

class PasswordEditDialoge extends Component {
	render() {
		const { validateForm, onSubmit, handleClose } = this
		const { classes, open, values } = this.props
		const decrypted = values && decrypt(values.password, JSON.parse(localStorage.getItem('user')).password)

		return (
			<Dialog open={open} onClose={handleClose}>
				<DialogContent className={classes.dialogeContent}>
					<Typography component='h1' variant='h5'>Edit Account</Typography>
					<Formik initialValues={{ ...values, password: decrypted }} validate={validateForm} onSubmit={onSubmit}>
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
									<Button type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Update</Button>
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
		const { update, enqueueSnackbar } = this.props
		setTimeout(() => {
			Api.passwords.update(values).then(res => {
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

export default withStyles(styles, { withTheme: true })(withSnackbar(PasswordEditDialoge))