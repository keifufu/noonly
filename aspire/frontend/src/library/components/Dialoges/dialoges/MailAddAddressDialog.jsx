import { Button, DialogActions, makeStyles } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import TextField from 'library/components/TextField'
import Dialog from 'library/components/Dialog'

const useStyles = makeStyles((theme) => ({
	input: {
		[theme.breakpoints.up('sm')]: {
			width: 300
		}
	}
}))

function MailAddAddressDialog({ id, dialog, openDialog, addAddress }) {
	const { open } = dialog
	const classes = useStyles()

	const initialValues = {
		address: ''
	}

	const validateForm = (values) => {
		const errors = {}
		const [address] = values.address.split('@')
		if (address.length < 1) errors.address = 'Address has to be longer than 1 character'
		if (address.length > 40) errors.address = 'Address can\'t be longer than 40 characters'
		if (address.match(/[^A-Za-z0-9_.]/)) errors.address = 'Address can only contain A-Z 0-9 . _'
		if (['.', '_'].includes(address[0])) errors.address = 'Address cannot start with a special character'
		if (['.', '_'].includes(address[address.length - 1])) errors.address = 'Address cannot end with a special character'
		return errors
	}

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			addAddress({
				address: values.address,
				onSuccess: () => {
					openDialog({
						id: 18
					})
				},
				onFail: () => setSubmitting(false)
			})
		}, 500)
	}

	return (
		<Dialog
			open={open === id}
			title='Add Address'
			marginBottom='12px'
			onClose={() => {
				openDialog({
					id: 18
				})
			}}
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
							className={classes.input}
							component={TextField}
							variant='outlined'
							margin='normal'
							fullWidth
							autoFocus
							name='address'
							label='Address'
							textadornment='@aspire.icu'
						/>
						<DialogProgress visible={isSubmitting} />
						<DialogActions>
							<Button variant='text' disabled={isSubmitting} onClick={() => {
								openDialog({
									id: 18
								})
							}} color='primary'>Cancel</Button>
							<Button variant='contained' type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>
								Add Address
							</Button>
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
	openDialog: dispatch.dialog.open,
	addAddress: dispatch.mail.addAddress
})
export default connect(mapState, mapDispatch)(MailAddAddressDialog)