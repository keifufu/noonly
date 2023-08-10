import { Button, DialogActions } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import TextField from 'library/components/TextField'
import decrypt from 'library/utilities/decrypt'
import Dialog from 'library/components/Dialog'

function PasswordEditDialog({ id, dialog, closeDialog, updatePassword }) {
	const { open, payload: password } = dialog

	const initialValues = {
		site: password?.site,
		username: password?.username,
		email: password?.email,
		password: decrypt(password?.password)
	}

	const validateForm = (values) => {
		const errors = {}
		if (!values.site) errors.site = 'Required'
		if (!values.password) errors.password = 'Required'
		if (values.site.length > 128) errors.site = 'Site can\'t be longer than 128'
		if (values.username.length > 128) errors.username = 'Username can\'t be longer than 128'
		if (values.email.length > 128) errors.email = 'Email can\'t be longer than 128'
		if (values.password.length > 256) errors.password = 'Password can\'t be longer than 256'
		return errors
	}

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			updatePassword({
				...values,
				id: password.id,
				onSuccess: () => closeDialog(),
				onFail: () => setSubmitting(false)
			})
		}, 500)
	}

	return (
		<Dialog
			open={open === id}
			title='Edit Account'
			marginBottom='12px'
			width='sm'
		>
			<Formik
				initialValues={initialValues}
				validate={validateForm}
				validateOnChange={false}
				validateOnBlur={false}
				onSubmit={onSubmit}
			>
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
							passwordgenerator='true'
							password='true'
							strength='true'
							name='password'
							label='Password'
						/>
						<DialogProgress visible={isSubmitting} />
						<DialogActions>
							<Button variant='text' disabled={isSubmitting} onClick={closeDialog} color='primary'>Cancel</Button>
							<Button variant='contained' type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Update</Button>
						</DialogActions>
					</Form>
				)}
			</Formik>
		</Dialog>
	)
}

const mapState = (state) => ({
	dialog: state.dialog
})
const mapDispatch = (dispatch) => ({
	closeDialog: dispatch.dialog.close,
	updatePassword: dispatch.passwords.update
})
export default connect(mapState, mapDispatch)(PasswordEditDialog)