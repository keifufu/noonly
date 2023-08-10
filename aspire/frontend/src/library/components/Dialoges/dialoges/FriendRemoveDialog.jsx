import { Button, DialogActions, Typography } from '@material-ui/core'
import { Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import Dialog from 'library/components/Dialog'

function FriendRemoveDialog({ id, dialog, closeDialog, removeFriend }) {
	const { open, payload: friend } = dialog

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			removeFriend({
				user_id: friend.id,
				onSuccess: () => closeDialog(),
				onFail: () => setSubmitting(false)
			})
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
							Do you want to remove {friend.username} from your Friends?
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
	removeFriend: dispatch.friends.removeFriend
})
export default connect(mapState, mapDispatch)(FriendRemoveDialog)