import { Button, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { Dispatch } from 'main/store/store'
import FormInput from 'library/components/FormInput'
import FormSubmitButton from 'library/components/FormSubmitButton'
import Modal from '../../Modal'
import { ModalProps } from '../Modals'
import store from 'main/store'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import useIsMobile from 'library/hooks/useIsMobile'

const validate = {
	name: (value: string) => {
		if (value.length > 2048) return 'Name must be less than 2048 characters'
	}
}

/* This Modal is both used to create and rename Items */
const FileCreateModal: React.FC<ModalProps> = ({ modal }) => {
	const { isFolder, parentId, id, name } = modal.data
	const dispatch: Dispatch = useDispatch()
	const isMobile = useIsMobile()
	const { register, handleSubmit, formState: { errors }, reset } = useForm({ reValidateMode: 'onBlur' })
	const [isSubmitting, setSubmitting] = useState(false)

	/* Reset form after closing */
	useEffect(() => reset(), [modal.open, reset])

	const onSubmit = (data: any) => {
		setSubmitting(true)
		const state = store.getState()
		if (Object.values(state.files).find((file: any) => file.parentId === parentId && file.name === data.name && file.isFolder === isFolder)) {
			/* Timeout because otherwise it might close instantly */
			setTimeout(() => {
				dispatch.modal.open({
					id: 8,
					data: {
						name: data.name,
						isFolder,
						onCancel: () => setSubmitting(false),
						onOverwrite: () => {
							dispatch.files[name ? 'rename' : 'create']({
								id,
								parentId,
								isFolder,
								overwriteExisting: true,
								name: data.name,
								onSuccess: () => {
									modal.onClose()
									setSubmitting(false)
								},
								onFail: () => setSubmitting(false)
							})
						},
						onAppend: () => {
							dispatch.files[name ? 'rename' : 'create']({
								id,
								parentId,
								isFolder,
								appendName: true,
								name: data.name,
								onSuccess: () => {
									modal.onClose()
									setSubmitting(false)
								},
								onFail: () => setSubmitting(false)
							})
						}
					}
				})
			}, 100)
		} else {
			dispatch.files[name ? 'rename' : 'create']({
				id,
				parentId,
				isFolder,
				name: data.name,
				onSuccess: () => {
					modal.onClose()
					setSubmitting(false)
				},
				onFail: () => setSubmitting(false)
			})
		}
	}

	return (
		<Modal
			disabled={isSubmitting}
			header={`${name ? 'Rename' : 'Create'} ${isFolder ? 'Folder' : 'File'}`}
			onClose={isSubmitting ? () => null : modal.onClose}
			isOpen={modal.open}
			size='sm'
			buttons={<>
				<Button disabled={isSubmitting} variant='ghost' onClick={modal.onClose} mr='3'>Cancel</Button>
				<FormSubmitButton onClick={handleSubmit(onSubmit)} isDisabled={isSubmitting} isLoading={isSubmitting}>{name ? 'Rename' : 'Create'}</FormSubmitButton>
			</>}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing='6'>
					<FormInput autoFocus={!isMobile} isRequired label='Name' register={register} error={errors.name} isDisabled={isSubmitting} validate={validate.name} />
				</Stack>
			</form>
		</Modal>
	)
}

export default FileCreateModal