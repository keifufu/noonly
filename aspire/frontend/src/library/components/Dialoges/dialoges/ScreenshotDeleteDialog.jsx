import { Button, DialogActions, Typography } from '@material-ui/core'
import { Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import Dialog from 'library/components/Dialog'

function ScreenshotDeleteDialog({ id, dialog, closeDialog, deleteScreenshot }) {
	const { open, payload: selection } = dialog

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			deleteScreenshot({
				ids: selection,
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
							This item will be deleted forever and you won't be able to restore it.
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
	deleteScreenshot: dispatch.screenshots.delete
})
export default connect(mapState, mapDispatch)(ScreenshotDeleteDialog)