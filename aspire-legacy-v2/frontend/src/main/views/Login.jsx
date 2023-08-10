import { Avatar, Button, Checkbox, Container, Link, FormControlLabel, Grid, makeStyles, Paper, Typography } from '@material-ui/core'
import { LockOutlined } from '@material-ui/icons'
import { useHistory } from 'react-router-dom'
import { Field, Form, Formik } from 'formik'
import { useDispatch } from 'react-redux'
import Helmet from 'react-helmet'

import DialogProgress from 'library/components/DialogProgress/DialogProgress'
import TextField from 'library/components/TextField'
import setCookie from 'library/utilities/setCookie'
import storage from 'library/utilities/storage'
import encrypt from 'library/utilities/encrypt'
import post from 'main/axios/post'

const useStyles = makeStyles((theme) => ({
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
	checkbox: {
		marginLeft: theme.spacing(0.5)
	},
	progress: {
		marginTop: theme.spacing(1)
	},
	button: {
		margin: theme.spacing(1, 0, 2)
	}
}))

function Login() {
	const classes = useStyles()
	const history = useHistory()
	const dispatch = useDispatch()
	const initialValues = {
		username: '',
		password: '',
		rememberMe: true
	}

	const validateForm = (values) => {
		const errors = {}
		if (!values.username) errors.username = 'Required'
		if (!values.password) errors.password = 'Required'
		return errors
	}

	const submitForm = (values, { setSubmitting }) => {
		setTimeout(() => {
			post('/auth/login', {
				username: values.username,
				password: encrypt(values.password, values.password)
			}).then((res) => {
				setSubmitting(false)
				/* Outdated but still needed rememberMe logic */
				if (values.rememberMe) setCookie('rememberMe', 'true', '99999')
				else setCookie('rememberMe', 'true')

				storage.setItem('jwt_token', res.token)
				storage.setItem('encrypted_password', encrypt(values.password, storage.user.username))
				window.location.reload()
			}).catch((error) => {
				setSubmitting(false)
				dispatch.notifications.add({
					text: error.message,
					severity: 'error'
				})
			})
		}, 500)
	}

	return (<>
		<Helmet>
			<title>Login - {process.env.REACT_APP_NAME}</title>
		</Helmet>
		<Container component='main' maxWidth='xs'>
			<Paper className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlined />
				</Avatar>
				<Typography component='h1' variant='h5'>
					Sign In
				</Typography>
				<Formik
					initialValues={initialValues}
					validate={validateForm}
					onSubmit={submitForm}
				>
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
							<FormControlLabel
								control={
									<Field
										component={Checkbox}
										color='primary'
										type='checkbox'
										id='rememberMe'
										checked={values.rememberMe}
										onChange={handleChange}
										className={classes.checkbox}
									/>
								}
								label='Remember me'
							/>
							<DialogProgress className={classes.progress} visible={isSubmitting} />
							<Button
								type='submit'
								disabled={isSubmitting}
								onClick={submitForm}
								fullWidth
								variant='contained'
								color='primary'
								className={classes.button}
							>
								Sign In
							</Button>
							<Grid container>
								<Grid item xs />
								<Grid item>
									<Link
										style={{ cursor: 'pointer' }}
										onClick={() => history.push('/register')}
										variant='body2'
									>
										Don't have an account? Sign up
									</Link>
								</Grid>
							</Grid>
						</Form>
					)}
				</Formik>
			</Paper>
		</Container>
	</>)
}

export default Login