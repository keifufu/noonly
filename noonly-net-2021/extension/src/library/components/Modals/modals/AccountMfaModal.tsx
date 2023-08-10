import { Button, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import FormInput from 'library/components/FormInput'
import FormSubmitButton from 'library/components/FormSubmitButton'
import decrypt from 'library/utilities/decrypt'
import encrypt from 'library/utilities/encrypt'
import { Dispatch } from 'main/store/store'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Modal from '../../Modal'
import { ModalProps } from '../Modals'

const validate = {
	mfaSecret: (value: string) => {
		if (value.length > 256) return 'mfaSecret must be less than 256 characters'
	}
}

const AccountMfaModal: React.FC<ModalProps> = ({ modal }) => {
	const dispatch: Dispatch = useDispatch()
	const account: Noonly.API.Data.Account = modal.data
	const defaultValues = { mfaSecret: account.mfaSecret ? decrypt(account.mfaSecret) : '' }
	const { register, handleSubmit, formState: { errors }, reset } = useForm({ reValidateMode: 'onBlur', defaultValues })
	const [isSubmitting, setSubmitting] = useState(false)

	/* Reset form after closing */
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => reset(defaultValues), [modal.open, reset])

	const onSubmit = (data: any) => {
		setSubmitting(true)
		dispatch.accounts.setMfaSecret({
			id: account.id,
			mfaSecret: data.mfaSecret.length === 0 ? null : encrypt(data.mfaSecret.replaceAll(' ', '')),
			onSuccess: () => {
				modal.onClose()
				setSubmitting(false)
			},
			onFail: () => setSubmitting(false)
		})
	}

	return (
		<Modal
			disabled={isSubmitting}
			header={`${account.mfaSecret ? 'Edit' : 'Add'} Mfa Secret`}
			onClose={isSubmitting ? () => null : modal.onClose}
			isOpen={modal.open}
			size='2xl'
			buttons={<>
				<Button disabled={isSubmitting} variant='ghost' onClick={modal.onClose} mr='3'>Cancel</Button>
				<FormSubmitButton onClick={handleSubmit(onSubmit)} isDisabled={isSubmitting} isLoading={isSubmitting}>Update</FormSubmitButton>
			</>}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack
					spacing='6'
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !isSubmitting) {
							e.preventDefault()
							handleSubmit(onSubmit)()
						}
					}}
				>
					{/* eslint-disable-next-line max-len */}
					<FormInput valueName='mfaSecret' label='Mfa Secret' register={register} error={errors.mfaSecret} isDisabled={isSubmitting} validate={validate.mfaSecret} />
				</Stack>
			</form>
		</Modal>
	)
}

export default AccountMfaModal