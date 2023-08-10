import { Box, Container, Typography, withStyles, Link, Button, Grid, Paper, LinearProgress, Avatar } from '@material-ui/core'
import { LockOutlined } from '@material-ui/icons'
import { withRouter } from 'react-router-dom'
import { Field, Form, Formik } from 'formik'
import React, { Component } from 'react'
import { withSnackbar } from 'notistack'
import { setCookie } from '../Utilities'
import TextField from './TextField'
import Api from '../Api'

class Register extends Component {
	render() {
		const { classes, history } = this.props
		const { validateForm, onSubmit } = this

		return (
			<Container component='main' maxWidth='xs'>
				<Paper className={classes.paper}>
					<Avatar className={classes.avatar}>
						<LockOutlined />
					</Avatar>
					<Typography component="h1" variant="h5">Sign Up</Typography>
						<Formik initialValues={{ username: '', password: '', confirmPassword: '' }} validate={validateForm} onSubmit={onSubmit}>
							{({submitForm, isSubmitting, touched, errors}) => (
							<Form autoComplete='off'>
								<Field
									component={TextField}
									variant='outlined'
									margin='normal'
									fullWidth
									required
									type='username'
									name='username'
									label='Username'
								/>
								<Field
									component={TextField}
									variant='outlined'
									margin='normal'
									fullWidth
									required
									password='true'
									strength='true'
									type='password'
									name='password'
									label='Password'
								/>
								<Field
									component={TextField}
									variant='outlined'
									margin='normal'
									fullWidth
									required
									password='true'
									type='password'
									name='confirmPassword'
									label='Confirm Password'
								/>
								{isSubmitting && <LinearProgress /> }
								<Button type='submit' disabled={isSubmitting} onClick={submitForm} fullWidth variant='contained' color='primary' className={classes.submit}>Sign Up</Button>
								<Grid container>
									<Grid item xs></Grid>
									<Grid item>
										<Link style={{ cursor: 'pointer' }} onClick={() => history.push('/login')} variant='body2'>
											Already have an account? Sign in
										</Link>
									</Grid>
								</Grid>
							</Form>
						)}
					</Formik>
				</Paper>
				<Box mt={2} className={classes.copyright}>
					<Typography variant="body2" color="textSecondary" align="center">
						{'Copyright © '}
						<Link color="inherit" href=''>
							Aspire.icu
						</Link>{' '}
						{new Date().getFullYear()}
						{'.'}
					</Typography>
				</Box>
			</Container>
		)
	}

	validateForm = values => {
		const errors = {}
		if(values.password.length < 7) errors.password = 'Password not long enough'
		if(values.password.length > 256) errors.password = 'Password too long'
		if(values.username.length < 3) errors.username = 'Username too short'
		if(values.username.length > 24) errors.username = 'Username too long'
		if(!values.username) errors.username = 'Required'
		if(!values.password) errors.password = 'Required'
		if(values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match'
		return errors
	}

	onSubmit = (values, {setSubmitting}) => {
		if(localStorage.getItem('user')) return
		setTimeout(() => {
			Api.auth.register(values).then(res => {
				setSubmitting(false)
				if(values.rememberMe) setCookie('rememberMe', 'true', '99999')
				else setCookie('rememberMe', 'true')
				this.props.enqueueSnackbar('You will be redirected', { variant: 'success', autoHideDuration: 1500 })
				res.password = values.password
				localStorage.setItem('user', JSON.stringify(res))
				setTimeout(() => { this.props.setState({ loggedIn: true }) }, 1500)
			}).catch(err => {
				setSubmitting(false)
				this.props.enqueueSnackbar(err, { variant: 'error' })
			})
		}, 2500)
	}
}

const styles = theme => ({
	paper: {
		padding: theme.spacing(2),
		marginTop: theme.spacing(2),
		flexDirection: 'column',
		alignItems: 'center',
		display: 'flex'
	},
	form: {
		width: '100%',
		marginTop: theme.spacing(1)
	},
	submit: {
		margin: theme.spacing(3, 0, 2)
	},
	avatar: {
	  margin: theme.spacing(1),
	  backgroundColor: theme.palette.primary.main,
	},
	copyright: {
		marginBottom: theme.spacing(1)
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(withRouter(Register)))