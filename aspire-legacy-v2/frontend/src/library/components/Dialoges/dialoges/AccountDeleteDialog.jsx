import { Button, DialogActions, Typography } from '@material-ui/core'
import { Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import Dialog from 'library/components/Dialog'

function AccountDeleteDialog({ id, dialog, closeDialog, deleteAccount, clearTrash }) {
	const { open, payload: password } = dialog

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			if (password === 'clear') {
				clearTrash({
					onSuccess: () => closeDialog(),
					onFail: () => setSubmitting(false)
				})
			} else {
				deleteAccount({
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
									: 'You won\'t be able to recover deleted accounts.'
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
	deleteAccount: dispatch.accounts.delete,
	clearTrash: dispatch.accounts.clearTrash
})
export default connect(mapState, mapDispatch)(AccountDeleteDialog)