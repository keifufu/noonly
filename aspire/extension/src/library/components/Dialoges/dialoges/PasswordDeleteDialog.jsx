import { Button, DialogActions, Typography } from '@material-ui/core'
import { Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import Dialog from 'library/components/Dialog'

function PasswordDeleteDialog({ id, dialog, closeDialog, deletePassword, clearTrash }) {
	const { open, payload: password } = dialog

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			if (password === 'clear') {
				clearTrash({
					onSuccess: () => closeDialog(),
					onFail: () => setSubmitting(false)
				})
			} else {
				deletePassword({
					id: password.id,
					onSuccess: () => closeDialog(),
					onFail: () => setSubmitting(false)
				})
			}
		}, 500)
	}

	return (
		<Dialog
			open={open === id}
			title='Are you sure?'
			marginBottom='12px'
			onClose={closeDialog}
		>
			<Formik
				initialValues={{}}
				onSubmit={onSubmit}
			>
				{({ submitForm, isSubmitting }) => (
					<Form autoComplete='off'>
						<Typography color='textSecondary'>
							{
								password === 'clear'
									? 'All items in the trash will be deleted and you won\'t be able to restore them'
									: 'You won\'t be able to recover deleted passwords.'
							}
						</Typography>
						<DialogProgress visible={isSubmitting} />
						<DialogActions>
							<Button variant='text' disabled={isSubmitting} onClick={closeDialog} color='primary'>Cancel</Button>
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
	closeDialog: dispatch.dialog.close,
	deletePassword: dispatch.passwords.delete,
	clearTrash: dispatch.passwords.clearTrash
})
export default connect(mapState, mapDispatch)(PasswordDeleteDialog)