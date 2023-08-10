import { Button, Checkbox, DialogActions, FormControlLabel, makeStyles } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import IconButton from 'library/components/IconButton'
import TextField from 'library/components/TextField'
import Dialog from 'library/components/Dialog'
import { Close } from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
	root: {
		paddingTop: '0px !important',
		width: 400
	},
	passwordBox: {
		marginTop: theme.spacing(1),
		marginBottom: 0
	}
}))

function CloudShareDialog({ id, dialog, cloud, closeDialog, setShared, openDialog }) {
	const { open, payload: _file } = dialog
	const classes = useStyles()

	const file = cloud[_file?.id]

	const sharedUrl = file?.sharedKey ? `https://${process.env.REACT_APP_HOSTNAME}/dl/${file.sharedKey}` : ''
	const initialValues = {
		sharedUrl: sharedUrl,
		usePassword: file?.sharedPassword?.length > 0,
		password: file?.sharedPassword || ''
	}

	const validateForm = (values) => {
		const errors = {}
		if (values.password.length > 1024) errors.password = 'Password is too long'
		if (values.usePassword && values.password.length < 3) errors.password = 'Password is too short'
		return errors
	}

	const onSubmit = (values, { setSubmitting, setFieldValue }) => {
		const password = values.usePassword ? values.password : null
		setTimeout(() => {
			setShared({
				id: file?.id,
				password: password,
				onSuccess: (sharedKey) => {
					setSubmitting(false)
					const sharedUrl = sharedKey ? `https://${process.env.REACT_APP_HOSTNAME}/dl/${sharedKey}` : ''
					setFieldValue('sharedUrl', sharedUrl)
				},
				onFail: () => setSubmitting(false)
			})
		}, 500)
	}

	return (
		<Dialog
			open={open === id}
			contentClass={classes.root}
			marginBottom='12px'
			onClose={closeDialog}
		>
			<Formik
				initialValues={initialValues}
				validate={validateForm}
				validateOnChange={false}
				validateOnBlur={false}
				onSubmit={onSubmit}
			>
				{({ submitForm, isSubmitting, handleChange, values }) => (
					<Form autoComplete='off'>
						<Field
							component={TextField}
							disabled
							variant='outlined'
							margin='normal'
							fullWidth
							copybutton={values.sharedUrl.length > 0 ? 1 : 0}
							name='sharedUrl'
							label={values.sharedUrl.length > 0 ? 'Download Link' : 'Click Share to create a Download Link'}
							endadornment={
								values.sharedUrl.length > 0
									? <IconButton
										onClick={() => {
											openDialog({
												id: 13,
												payload: file
											})
										}}
										icon={Close}
										tooltip='Delete Link'
										size={42}
									/>
									: <div />
							}
						/>
						<FormControlLabel
							control={
								<Field
									component={Checkbox}
									color='primary'
									type='checkbox'
									id='usePassword'
									checked={values.usePassword}
									onChange={handleChange}
								/>
							}
							label='Use Password'
						/>
						{
							values.usePassword
							&& <Field
								component={TextField}
								variant='outlined'
								margin='normal'
								fullWidth
								password='true'
								passwordgenerator='true'
								strength='true'
								name='password'
								label='password'
								className={classes.passwordBox}
							/>
						}
						<DialogProgress visible={isSubmitting} />
						<DialogActions>
							<Button variant='text' disabled={isSubmitting} onClick={closeDialog} color='primary'>Cancel</Button>
							<Button variant='contained' type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>
								{ values.sharedUrl ? 'Update' : 'Share' }
							</Button>
						</DialogActions>
					</Form>
				)}
			</Formik>
		</Dialog>
	)
}

const mapState = (state) => ({
	dialog: state.dialog,
	cloud: state.cloud
})
const mapDispatch = (dispatch) => ({
	closeDialog: dispatch.dialog.close,
	setShared: dispatch.cloud.setShared,
	openDialog: dispatch.dialog.open
})
export default connect(mapState, mapDispatch)(CloudShareDialog)