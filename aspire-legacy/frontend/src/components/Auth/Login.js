import {  Container, Typography, withStyles, Link, FormControlLabel, Checkbox, Button, Grid, Paper, LinearProgress, Avatar } from '@material-ui/core'
import { LockOutlined } from '@material-ui/icons'
import { withRouter } from 'react-router-dom'
import { Field, Form, Formik } from 'formik'
import { setCookie } from '../../Utilities'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import TextField from '../TextField'
import Copyright from './Copyright'
import Api from '../../Api'

class Login extends Component {
	render() {
		const { validateForm, onSubmit } = this
		const { classes, history } = this.props

		return (
			<Container component='main' maxWidth='xs'>
				<Paper className={classes.paper}>
					<Avatar className={classes.avatar}>
						<LockOutlined />
					</Avatar>
					<Typography component='h1' variant='h5'>Sign In</Typography>
						<Formik initialValues={{ username: '', password: '', rememberMe: true }} validate={validateForm} onSubmit={onSubmit}>
							{({ submitForm, isSubmitting, handleChange, values }) => (
							<Form autoComplete='off'>
								<Field
									component={TextField}
									variant='outlined'
									margin='normal'
									fullWidth
									required
									name='username'
									type='username'
									label='Username'
								/>
								<Field
									component={TextField}
									variant='outlined'
									margin='normal'
									fullWidth
									required
									password='true'
									name='password'
									type='password'
									label='Password'
								/>
								<FormControlLabel control={ <Field component={Checkbox} color='primary' type='checkbox' id='rememberMe' checked={values.rememberMe} onChange={handleChange} /> } label='Remember me' />
								{isSubmitting && <LinearProgress /> }
								<Button type='submit' disabled={isSubmitting} onClick={submitForm} fullWidth variant='contained' color='primary' className={classes.button}>Sign In</Button>
								<Grid container>
									<Grid item xs></Grid>
									<Grid item>
										<Link style={{ cursor: 'pointer' }} onClick={() => history.push('/register')} variant='body2'>
											Don't have an account? Sign up
										</Link>
									</Grid>
								</Grid>
							</Form>
						)}
					</Formik>
				</Paper>
				<Copyright />
			</Container>
		)
	}

	validateForm = values => {
		const errors = {}
		if(!values.username) errors.username = 'Required'
		if(!values.password) errors.password = 'Required'
		return errors
	}

	onSubmit = (values, {setSubmitting}) => {
		if(localStorage.getItem('user')) return
		setTimeout(() => {
			Api.auth.login(values).then(res => {
				setSubmitting(false)
				if(values.rememberMe) setCookie('rememberMe', 'true', '99999')
				else setCookie('rememberMe', 'true')
				this.props.enqueueSnackbar('You will be redirected', { variant: 'success', autoHideDuration: 1500 })
				res.password = values.password
				localStorage.setItem('user', JSON.stringify(res))
				window.location.reload()
				// setTimeout(() => { this.props.setState({ loggedIn: true }) }, 1500)
			}).catch(err => {
				setSubmitting(false)
				this.props.enqueueSnackbar(err, { variant: 'error' })
			})
		}, 1500)
	}
}

const styles = theme => ({
	paper: {
		marginTop: theme.spacing(12),
		padding: theme.spacing(2),
		flexDirection: 'column',
		alignItems: 'center',
		display: 'flex'
	},
	avatar: {
		backgroundColor: theme.palette.primary.main,
		margin: theme.spacing(1)
	},
	button: {
		margin: theme.spacing(3, 0, 2)
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(withRouter(Login)))