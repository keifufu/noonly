import { Button, DialogActions, Typography } from '@material-ui/core'
import { Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import Dialog from 'library/components/Dialog'

function CloudDeleteSharedDialog({ id, dialog, deleteShared, openDialog }) {
	const { open, payload: file } = dialog

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			deleteShared({
				id: file?.id,
				onSuccess: () => {
					openDialog({
						id: 12,
						payload: file
					})
				},
				onFail: () => setSubmitting(false)
			})
		}, 500)
	}

	return (
		<Dialog
			open={open === id}
			title='Are you sure?'
			marginBottom='12px'
			onClose={() => {
				openDialog({
					id: 12,
					payload: file
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
							You can always re-share Files & Folders.
						</Typography>
						<DialogProgress visible={isSubmitting} />
						<DialogActions>
							<Button variant='text' disabled={isSubmitting} onClick={() => {
								openDialog({
									id: 12,
									payload: file
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
	deleteShared: dispatch.cloud.deleteShared,
	openDialog: dispatch.dialog.open
})
export default connect(mapState, mapDispatch)(CloudDeleteSharedDialog)