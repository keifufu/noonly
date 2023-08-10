/* eslint-disable array-element-newline */
import { Button, DialogActions, fade, makeStyles } from '@material-ui/core'
import { insertNewUnstyledBlock } from 'draftjs-utils'
import { convertToRaw, EditorState, RichUtils } from 'draft-js'
import ChipInput from 'material-ui-chip-input'
import { Editor } from 'react-draft-wysiwyg'
import { Field, Form, Formik } from 'formik'
import draftToHtml from 'draftjs-to-html'
import { connect } from 'react-redux'
import { useState } from 'react'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

import DialogProgress from 'library/components/DialogProgress'
import TextField from 'library/components/TextField'
import Dialog from 'library/components/Dialog'
import { useTheme } from '@material-ui/styles'

const useStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.up('sm')]: {
			width: 900
		},
		overflowX: 'hidden',
		lineBreak: 'auto'
	},
	editor: {
		cursor: 'text',
		backgroundColor: '#fff',
		borderRadius: 4,
		marginTop: theme.spacing(1),
		overflowX: 'hidden',
		overflowY: 'scroll',
		height: 400,
		padding: theme.spacing(0, 1),
		lineBreak: 'auto',
		color: 'black',
		border: '1px solid #F1F1F1',
		[theme.breakpoints.down('xs')]: {
			height: 250
		}
	},
	toolbarButton: {
	},
	recipientList: {
		display: 'flex',
		flexDirection: 'row',
		listStyleType: 'none',
		position: 'relative',
		top: -57,
		left: -30
	},
	recipient: {
		marginRight: theme.spacing(0.5)
	}
}))


function MailComposeDialog({ id, dialog, closeDialog: _closeDialog, sendMail }) {
	const { open, payload: addresses } = dialog
	const classes = useStyles()
	const theme = useTheme()
	const [editorState, setEditorState] = useState(EditorState.createEmpty())
	const [recipients, setRecipients] = useState(addresses || [])

	const handleAdd = (recipientToAdd) => {
		setRecipients((recipients) => [...recipients, recipientToAdd])
	}

	const handleDelete = (recipientToDelete) => {
		setRecipients((recipients) => recipients.filter((recipient) => recipient !== recipientToDelete))
	}

	const closeDialog = () => {
		setEditorState(EditorState.createEmpty())
		setRecipients([])
		_closeDialog()
	}

	const validateForm = (values) => {
		const errors = {}
		if (values.subject.length < 1) errors.subject = 'Subject must be at least 1 character long'
		if (values.subject.length > 255) errors.subject = 'Subject can\'t be longer than 255 characters'
		if (recipients.length === 0) errors.recipients = 'Please specify a Recipient'
		return errors
	}

	const initialValues = {
		subject: ''
	}

	const onSubmit = (values, { setSubmitting }) => {
		const html = draftToHtml(convertToRaw(editorState.getCurrentContent()))
		const text = editorState.getCurrentContent().getPlainText('\u0001')
		setTimeout(() => {
			sendMail({
				subject: values.subject,
				recipients,
				html,
				text,
				onSuccess: () => closeDialog(),
				onFail: () => setSubmitting(false)
			})
		}, 500)
	}

	/* Imgur has file size limits, obviously; So switch this to internal image upload service, or figure out a way to use attachments for embedded images */
	/* This doesn't work anyways right now */
	const uploadImageCallback = (file) => new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		xhr.open('POST', 'https://api.imgur.com/3/upload')
		xhr.setRequestHeader('Authorization', 'Client-ID d31c1dda4f40300')
		const data = new FormData()
		data.append('image', file)
		xhr.send(data)
		xhr.addEventListener('load', () => {
			const response = JSON.parse(xhr.responseText)
			resolve(response)
		})
		xhr.addEventListener('error', () => {
			const error = JSON.parse(xhr.responseText)
			reject(error)
		})
	})

	return (
		<Dialog
			open={open === id}
			title='Compose Mail'
			marginBottom='12px'
			width='md'
		>
			<Formik
				initialValues={initialValues}
				validate={validateForm}
				validateOnChange={false}
				validateOnBlur={false}
				onSubmit={onSubmit}
			>
				{({ submitForm, isSubmitting, errors, setFieldError }) => (
					<Form autoComplete='off'>
						<div className={classes.root}>
							<Field
								component={TextField}
								variant='outlined'
								margin='normal'
								fullWidth
								required
								name='subject'
								label='Subject'
							/>
							<Field
								component={ChipInput}
								disabled={isSubmitting}
								blurBehavior='add'
								fullWidth
								required
								label='Recipients'
								variant='outlined'
								style={{ backgroundColor: fade('#000', 0.1) }}
								error={errors.recipients}
								newChipKeyCodes={[13, 32]}
								onBeforeAdd={(recipient) => {
									// eslint-disable-next-line max-len
									const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
									if (recipient.match(regex)) {
										setFieldError('recipients', null)
										return true
									}
									return false
								}}
								value={recipients}
								onAdd={(recipient) => handleAdd(recipient)}
								onDelete={(chip) => handleDelete(chip)}
								name='recipients'
							/>
							<Editor
								readOnly={isSubmitting}
								editorState={editorState}
								toolbarClassName={classes.toolbar}
								toolbarStyle={{
									color: 'black',
									borderRadius: 4,
									marginTop: theme.spacing(1.5),
									backgroundColor: theme.palette.background.paper
								}}
								wrapperClassName={classes.wrapper}
								editorClassName={classes.editor}
								onEditorStateChange={setEditorState}
								hashtag={{
									seperator: ' ',
									trigger: '#'
								}}
								handleReturn={(event) => {
									// Override behavior for Enter key
									let newEditorState = null
									if (event.keyCode === 13 && event.shiftKey) {
										// With Shift, make a new block
										newEditorState = insertNewUnstyledBlock(editorState)
									} else if (event.keyCode === 13 && !event.shiftKey) {
										// Without Shift, just a normal line break
										newEditorState = RichUtils.insertSoftNewline(editorState)
									}
									if (newEditorState) {
										setEditorState(newEditorState)
										return true
									}
									return false
								}}
								toolbar={{
									options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'history'],
									inline: {
										className: classes.inline,
										inDropdown: false,
										options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace', 'superscript', 'subscript'],
										bold: { className: classes.toolbarButton },
										italic: { className: classes.toolbarButton },
										underline: { className: classes.toolbarButton },
										strikethrough: { className: classes.toolbarButton },
										monospace: { className: classes.toolbarButton },
										superscript: { className: classes.toolbarButton },
										subscript: { className: classes.toolbarButton }
									},
									blockType: {
										inDropdown: true,
										options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code']
									},
									fontSize: {
										options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96]
									},
									fontFamily: {
										options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana']
									},
									list: {
										inDropdown: true,
										options: ['unordered', 'ordered', 'indent', 'outdent']
									},
									textAlign: {
										inDropdown: false,
										options: ['left', 'center', 'right', 'justify']
									},
									colorPicker: {
										colors: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(84,172,210)', 'rgb(44,130,201)',
											'rgb(147,101,184)', 'rgb(71,85,119)', 'rgb(204,204,204)', 'rgb(65,168,95)', 'rgb(0,168,133)',
											'rgb(61,142,185)', 'rgb(41,105,176)', 'rgb(85,57,130)', 'rgb(40,50,78)', 'rgb(0,0,0)',
											'rgb(247,218,100)', 'rgb(251,160,38)', 'rgb(235,107,86)', 'rgb(226,80,65)', 'rgb(163,143,132)',
											'rgb(239,239,239)', 'rgb(255,255,255)', 'rgb(250,197,28)', 'rgb(243,121,52)', 'rgb(209,72,65)',
											'rgb(184,49,47)', 'rgb(124,112,107)', 'rgb(209,213,216)']
									},
									link: {
										inDropdown: true,
										options: ['link', 'unlink']
									},
									emoji: {},
									embedded: {
										defaultSize: {
											height: 'auto',
											width: 'auto'
										}
									},
									image: {
										urlEnabled: true,
										uploadEnabled: true,
										alignmentEnabled: true,
										uploadCallback: uploadImageCallback,
										previewImage: true,
										inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
										alt: { present: false, mandatory: false },
										defaultSize: {
											height: 'auto',
											width: 'auto'
										}
									},
									history: {
										inDropdown: true,
										options: ['undo', 'redo']
									}
								}}
							/>
							<DialogProgress visible={isSubmitting} />
							<DialogActions>
								<Button variant='text' disabled={isSubmitting} onClick={closeDialog} color='primary'>Cancel</Button>
								<Button variant='contained' disabled={isSubmitting} onClick={submitForm} color='primary'>Send</Button>
							</DialogActions>
						</div>
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
	sendMail: dispatch.mail.send
})
export default connect(mapState, mapDispatch)(MailComposeDialog)