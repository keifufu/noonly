import { Button, Dialog, DialogActions, DialogContent, LinearProgress, Typography, withStyles } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import TextField from '../../TextField'
import Api from '../../../Api'

class FriendAddDialog extends Component {
	render() {
		const { validateForm, onSubmit, handleClose } = this
        const { classes, open } = this.props

		return (
			<Dialog open={open} onClose={handleClose}>
			<DialogContent className={classes.dialogeContent}>
				<Typography component='h1' variant='h5'>Add Friend</Typography>
				<Formik initialValues={{ username: '' }} validate={validateForm} onSubmit={onSubmit}>
					{({ submitForm, isSubmitting }) => (
					<Form autoComplete='off'>
						<Field
							component={TextField}
							variant='outlined'
							margin='normal'
							fullWidth
							name='username'
							label='Username'
						/>
						{isSubmitting && <LinearProgress /> }
						<DialogActions>
							<Button onClick={handleClose} color='primary'>Cancel</Button>
							<Button type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Send</Button>
						</DialogActions>
					</Form>	)}
				</Formik>
			</DialogContent>
			</Dialog>
		)
    }
    
    validateForm = values => {
		const errors = {}
		if(values.username.length < 3) errors.username = 'Invalid username'
		if(values.username.length > 24) errors.username = 'Invalid username'
        return errors
    }

	onSubmit = (values, { setSubmitting }) => {
		const { enqueueSnackbar } = this.props
		setTimeout(() => {
            Api.friends.requests.send(values.username).then(res => {
                this.handleClose()
                enqueueSnackbar(res, { variant: 'success' })
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

export default withStyles(styles, { withTheme: true })(withSnackbar(FriendAddDialog))