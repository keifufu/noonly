import { Button, DialogActions, Typography } from '@material-ui/core'
import { Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import Dialog from 'library/components/Dialog'

function MailAddressDeleteDialog({ id, dialog, openDialog, deleteAddress }) {
	const { open, payload: address } = dialog

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			deleteAddress({
				address,
				onSuccess: () => {
					/* Timeout because otherwise the fucking idiot of a dialog wont be updated by the redux store changing after the address is deleted */
					setTimeout(() => {
						openDialog({
							id: 18
						})
					}, 500)
				},
				onFail: () => setSubmitting(false)
			})
		}, 0)
	}

	return (
		<Dialog
			open={open === id}
			title='Delete Address'
			marginBottom='12px'
			onClose={() => {
				openDialog({
					id: 18
				})
			}}
		>
			<Formik
				initialValues={{}}
				onSubmit={onSubmit}
			>
				{({ submitForm, isSubmitting }) => (
					<Form autoComplete='off'>
						<Typography color='textSecondary'>
							Are you sure you want to delete this address and all its mail?
						</Typography>
						<DialogProgress visible={isSubmitting} />
						<DialogActions>
							<Button variant='text' disabled={isSubmitting} onClick={() => {
								openDialog({
									id: 18
								})
							}} color='primary'>Cancel</Button>
							<Button variant='contained' type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Confirm</Button>
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
	deleteAddress: dispatch.mail.deleteAddress
})
export default connect(mapState, mapDispatch)(MailAddressDeleteDialog)