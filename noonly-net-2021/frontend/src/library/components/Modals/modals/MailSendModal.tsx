import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

import { Box, Button, Menu, MenuButton, MenuItemOption, MenuList, MenuOptionGroup } from '@chakra-ui/react'
import { EditorState, RichUtils, convertToRaw } from 'draft-js'

import { Editor } from 'react-draft-wysiwyg'
import FormInput from 'library/components/FormInput'
import FormSubmitButton from 'library/components/FormSubmitButton'
import { GoArrowRight } from 'react-icons/go'
import Modal from '../../Modal'
import { ModalProps } from '../Modals'
import { RootState } from 'main/store/store'
import draftToHtml from 'draftjs-to-html'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const draftJsUtilsModule = require('draftjs-utils')
const { insertNewUnstyledBlock } = draftJsUtilsModule

const validate = {
	recipients: (val: string) => {
		if (!val) return 'Please specify at least one recipient'
	}
}

const MailSendModal: React.FC<ModalProps> = ({ modal }) => {
	const user = useSelector((state: RootState) => state.user)
	const [selectedAddress, setSelectedAddress] = useState(user.selectedAddress)
	const [editorState, setEditorState] = useState(EditorState.createEmpty())
	const onSelectedAddressChange = (val: string | string[]) => setSelectedAddress(val as string)
	const [isEditorOpen, setIsEditorOpen] = useState(false)
	const [previewHtml, setPreviewHtml] = useState('')
	const [isSubmitting, setSubmitting] = useState(false)
	const { register, handleSubmit, formState: { errors }, reset } = useForm({ reValidateMode: 'onBlur' })

	const onSubmit = (data: any) => {
		setSubmitting(true)
	}

	const closeModal = () => {
		const confirmation = confirm('Are you sure? This will discard the Email.')
		if (!confirmation) return
		setEditorState(EditorState.createEmpty())
		setPreviewHtml('')
		setSelectedAddress(user.selectedAddress)
		reset()
		modal.onClose()
	}

	return (
		<Modal
			header='Compose Mail'
			onClose={closeModal}
			isOpen={modal.open}
			size='2xl'
			buttons={<>
				<Button
					isLoading={isSubmitting}
					disabled={isSubmitting}
					variant='filled'
					onClick={() => setIsEditorOpen(true)}
					bg='blue.600'
					_hover={{ bg: 'blue.500' }}
					_active={{ bg: 'blue.500' }}
					mr='auto'
				>
					Open Editor
				</Button>
				<Button disabled={isSubmitting} variant='ghost' onClick={closeModal} mr='3'>Cancel</Button>
				<FormSubmitButton onClick={handleSubmit(onSubmit)} isDisabled={isSubmitting} isLoading={isSubmitting}>Send</FormSubmitButton>
			</>}
		>
			<Box
				display='flex'
				mb='3'
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !isSubmitting) {
						e.preventDefault()
						handleSubmit(onSubmit)()
					}
				}}
			>
				<Menu>
					<MenuButton flexShrink={0} as={Button} variant='outline'>{user.addresses?.find((e) => e.id === selectedAddress)?.address}</MenuButton>
					<MenuList>
						<MenuOptionGroup onChange={onSelectedAddressChange} value={selectedAddress || undefined}>
							{user.addresses?.map(({ id, address }) => (
								<MenuItemOption value={id} key={id}>
									{address}
								</MenuItemOption>
							))}
						</MenuOptionGroup>
					</MenuList>
				</Menu>
				<Box as={GoArrowRight} size='40' px='2' />
				<FormInput label='Recipients' placeholder='Recipients separated by spaces' register={register}
					error={errors.recipients} isDisabled={isSubmitting} validate={validate.recipients} />
			</Box>
			<Modal
				header='Edit Content'
				isOpen={isEditorOpen}
				onClose={() => setIsEditorOpen(false)}
				size='4xl'
				buttons={<>
					<Button variant='ghost' onClick={() => setIsEditorOpen(false)} mr='3'>Cancel</Button>
					<Button
						isLoading={isSubmitting}
						disabled={isSubmitting}
						variant='filled'
						onClick={() => {
							setPreviewHtml(draftToHtml(convertToRaw(editorState.getCurrentContent())))
							setIsEditorOpen(false)
						}}
						bg='blue.600'
						_hover={{ bg: 'blue.500' }}
						_active={{ bg: 'blue.500' }}
					>
						Confirm
					</Button>
				</>}
			>
				<Box height='500px'>
					<Editor
						readOnly={isSubmitting}
						editorState={editorState}
						onEditorStateChange={setEditorState}
						hashtag={{
							separator: ' ',
							trigger: '#'
						}}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						handleReturn={(event: KeyboardEvent) => {
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
								inDropdown: false,
								options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace', 'superscript', 'subscript']
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
								colors: ['rgb(97,189,109)',
									'rgb(26,188,156)',
									'rgb(84,172,210)',
									'rgb(44,130,201)',
									'rgb(147,101,184)',
									'rgb(71,85,119)',
									'rgb(204,204,204)',
									'rgb(65,168,95)',
									'rgb(0,168,133)',
									'rgb(61,142,185)',
									'rgb(41,105,176)',
									'rgb(85,57,130)',
									'rgb(40,50,78)',
									'rgb(0,0,0)',
									'rgb(247,218,100)',
									'rgb(251,160,38)',
									'rgb(235,107,86)',
									'rgb(226,80,65)',
									'rgb(163,143,132)',
									'rgb(239,239,239)',
									'rgb(255,255,255)',
									'rgb(250,197,28)',
									'rgb(243,121,52)',
									'rgb(209,72,65)',
									'rgb(184,49,47)',
									'rgb(124,112,107)',
									'rgb(209,213,216)']
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
								uploadCallback: () => null,
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
				</Box>
			</Modal>
			<Box p='2' bg='white' rounded='md' color='black' maxHeight='500px' overflow='scroll'>
				{previewHtml.length > 0 && previewHtml !== '<p></p>\n' ? (
					<Box dangerouslySetInnerHTML={{ __html: previewHtml }} />
				) : (
					<Box fontWeight={600} color='gray.600'>
						Your Mail will preview here. Open the Editor to start composing!
					</Box>
				)}
			</Box>
		</Modal>
	)
}

export default MailSendModal