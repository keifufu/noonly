import { Avatar, Button, Container, Link, Grid, makeStyles, Paper, Typography } from '@material-ui/core'
import { LockOutlined } from '@material-ui/icons'
import { useHistory } from 'react-router-dom'
import { Field, Form, Formik } from 'formik'
import { useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet'

import DialogProgress from 'library/components/DialogProgress/DialogProgress'
import TextField from 'library/components/TextField'
import setCookie from 'library/utilities/setCookie'
import encrypt from 'library/utilities/encrypt'
import storage from 'library/utilities/storage'
import post from 'main/axios/post'

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(2),
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

function Register() {
	const classes = useStyles()
	const history = useHistory()
	const dispatch = useDispatch()
	const initialValues = {
		username: '',
		password: '',
		confirmPassword: ''
	}

	const validateForm = (values) => {
		const errors = {}
		if (values.password.length < 7) errors.password = 'Password not long enough'
		if (values.password.length > 256) errors.password = 'Password too long'
		if (values.username.length < 3) errors.username = 'Username too short'
		if (values.username.length > 24) errors.username = 'Username too long'
		if (!values.username) errors.username = 'Required'
		if (!values.password) errors.password = 'Required'
		if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match'
		const regexCopiedFromDaInternet = /^[A-Za-z0-9 ]+$/
		const isValid = regexCopiedFromDaInternet.test(values.username)
		if (!isValid) errors.username = 'Invalid Username'
		return errors
	}

	const submitForm = (values, { setSubmitting }) => {
		setTimeout(() => {
			post('/auth/register', {
				username: values.username,
				password: encrypt(values.password, values.password)
			}).then((res) => {
				setSubmitting(false)
				if (values.rememberMe) setCookie('rememberMe', 'true', '99999')
				else setCookie('rememberMe', 'true')

				const user = {
					...res.payload,
					password: encrypt(values.password, res.payload.username),
					version: 0.1
				}
				storage.setItem('user', user)
				window.setLoggedIn(true)
			}).catch((err) => {
				setSubmitting(false)
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		}, 500)
	}

	return (<>
		<Helmet>
			<title>Register - {process.env.REACT_APP_NAME}</title>
		</Helmet>
		<Container component='main' maxWidth='xs'>
			<Paper className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlined />
				</Avatar>
				<Typography component='h1' variant='h5'>
					Sign Up
				</Typography>
				<Formik
					initialValues={initialValues}
					validate={validateForm}
					onSubmit={submitForm}
				>
					{({ submitForm, isSubmitting }) => (
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
								passwordgenerator='true'
								strength='true'
								name='password'
								type='password'
								label='Password'
							/>
							<Field
								component={TextField}
								variant='outlined'
								margin='normal'
								fullWidth
								required
								password='true'
								name='confirmPassword'
								type='confirmPassword'
								label='Confirm Password'
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
								Sign Up
							</Button>
							<Grid container>
								<Grid item xs />
								<Grid item>
									<Link
										style={{ cursor: 'pointer' }}
										onClick={() => history.push('/login')}
										variant='body2'
									>
										Already have an account? Sign in
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

export default Register