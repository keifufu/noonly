import { Button, DialogActions } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import TextField from 'library/components/TextField'
import Dialog from 'library/components/Dialog'

function CloudFolderCreateDialog({ id, dialog, closeDialog, renameFile }) {
	const { open, payload: file } = dialog

	const initialValues = {
		name: file?.name
	}

	const validateForm = (values) => {
		const errors = {}
		if (values.name.length > 256) errors.name = 'Name can\'t be longer than 256'
		return errors
	}

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			renameFile({
				id: file?.id,
				name: values.name,
				currentName: file.name,
				onSuccess: () => closeDialog(),
				onFail: () => setSubmitting(false)
			})
		}, 500)
	}

	return (
		<Dialog
			open={open === id}
			title={`Rename ${file?.type === 'file' ? 'File' : 'Folder'}`}
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
				{({ submitForm, isSubmitting }) => (
					<Form autoComplete='off'>
						<Field
							component={TextField}
							variant='outlined'
							margin='normal'
							fullWidth
							autoFocus
							name='name'
							label='Name'
						/>
						<DialogProgress visible={isSubmitting} />
						<DialogActions>
							<Button variant='text' disabled={isSubmitting} onClick={closeDialog} color='primary'>Cancel</Button>
							<Button variant='contained' type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Rename</Button>
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
	renameFile: dispatch.cloud.renameFile
})
export default connect(mapState, mapDispatch)(CloudFolderCreateDialog)