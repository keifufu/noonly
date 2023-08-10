import { Button, DialogActions, Typography } from '@material-ui/core'
import { Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import Dialog from 'library/components/Dialog'

function CloudDeleteDialog({ id, selection, dialog, closeDialog, deleteFile, clearTrash, setSelection }) {
	const { open, payload: file } = dialog

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			if (file?.action === 'Clear Trash') {
				clearTrash({
					onSuccess: () => {
						setSelection([])
						closeDialog()
					},
					onFail: () => setSubmitting(false)
				})
			} else {
				const ids = selection.length > 0 ? selection : [file.id]
				deleteFile({
					ids,
					onSuccess: () => {
						setSelection([])
						closeDialog()
					},
					onFail: () => setSubmitting(false)
				})
			}
		}, 500)
	}

	return (
		<Dialog
			open={open === id}
			title='Are you sure?'
			width={file?.action === 'Clear Trash' && 'xs'}
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
								file?.action === 'Clear Trash'
									? 'All items in your Trash will be deleted forever and you won\'t be able to restore them.'
									: 'This item will be deleted forever and you won\'t be able to restore it.'
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
	dialog: state.dialog,
	selection: state.selection.cloud
})
const mapDispatch = (dispatch) => ({
	closeDialog: dispatch.dialog.close,
	deleteFile: dispatch.cloud.delete,
	setSelection: dispatch.selection.setCloudSelection,
	clearTrash: dispatch.cloud.clearTrash
})
export default connect(mapState, mapDispatch)(CloudDeleteDialog)