import { Button, DialogActions } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import TextField from 'library/components/TextField'
import Dialog from 'library/components/Dialog'

function CloudCreateFolderDialog({ id, dialog, closeDialog, createFolder }) {
	const { open, payload: parent_id } = dialog

	const initialValues = {
		name: ''
	}

	const validateForm = (values) => {
		const errors = {}
		if (values.name.length > 256) errors.name = 'Name can\'t be longer than 256'
		if (values.name.length < 1) errors.name = 'Name must be longer than 1 character'
		return errors
	}

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			createFolder({
				name: values.name,
				parent_id: parent_id,
				onSuccess: () => closeDialog(),
				onFail: () => setSubmitting(false)
			})
		}, 500)
	}

	return (
		<Dialog
			open={open === id}
			title='Create Folder'
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
							<Button variant='contained' type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Create</Button>
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
	createFolder: dispatch.cloud.createFolder
})
export default connect(mapState, mapDispatch)(CloudCreateFolderDialog)