import { Button, DialogActions, useMediaQuery } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { useEffect, useRef } from 'react'
import { connect } from 'react-redux'

import DialogProgress from 'library/components/DialogProgress'
import TextField from 'library/components/TextField'
import decrypt from 'library/utilities/decrypt'
import Dialog from 'library/components/Dialog'
import indent from 'library/utilities/indent'

function AccountNoteDialog({ id, dialog, closeDialog, editNote }) {
	const { open, payload: password } = dialog
	const inputRef = useRef(null)
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))

	useEffect(() => {
		setTimeout(() => {
			if (inputRef.current !== null)
				indent(inputRef.current)
		}, 100)
	}, [dialog])

	const decryptedNote = password ? decrypt(password.note) : ''
	const initialValues = {
		note: decryptedNote
	}

	const validateForm = (values) => {
		const errors = {}
		if (values.note.length > 512) errors.note = 'Note can\'t be longer than 512'
		return errors
	}

	const onSubmit = (values, { setSubmitting }) => {
		setTimeout(() => {
			editNote({
				id: password.id,
				note: values.note,
				onSuccess: () => closeDialog(),
				onFail: () => setSubmitting(false)
			})
		}, 500)
	}

	return (
		<Dialog
			open={open === id}
			title={`${decryptedNote.length > 0 ? 'Edit' : 'Add'} Note`}
			marginBottom='12px'
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
							multiline
							component={TextField}
							variant='outlined'
							margin='normal'
							fullWidth
							name='note'
							label='Note'
							inputProps={{
								style: {
									width: isMobile ? 300 : 450,
									height: isMobile ? 300 : 450,
									overflow: 'scroll'
								}
							}}
							inputRef={inputRef}
						/>
						<DialogProgress visible={isSubmitting} />
						<DialogActions>
							<Button variant='text' disabled={isSubmitting} onClick={closeDialog} color='primary'>Cancel</Button>
							<Button variant='contained' type='submit' disabled={isSubmitting} onClick={submitForm} color='primary'>Update</Button>
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
	editNote: dispatch.accounts.editNote
})
export default connect(mapState, mapDispatch)(AccountNoteDialog)