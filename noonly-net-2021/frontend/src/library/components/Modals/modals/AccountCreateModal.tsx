import { Button, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { Dispatch } from 'main/store/store'
import FormInput from 'library/components/FormInput'
import FormPasswordInput from 'library/components/FormPasswordInput'
import FormSubmitButton from 'library/components/FormSubmitButton'
import IconButton from 'library/components/IconButton'
import { MdVpnKey } from 'react-icons/md'
import Modal from '../../Modal'
import { ModalProps } from '../Modals'
import copy from 'library/utilities/copy'
import encrypt from 'library/utilities/encrypt'
import generatePassword from 'library/utilities/generatePassword'
import toast from 'library/utilities/toast'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import useIsMobile from 'library/hooks/useIsMobile'

const validate = {
	site: (value: string) => {
		if (value.length > 256) return 'Site must be less than 256 characters'
	},
	username: (value: string) => {
		if (value.length > 256) return 'Username must be less than 256 characters'
	},
	address: (value: string) => {
		if (value.length > 256) return 'Address must be less than 256 characters'
	},
	password: (value: string) => {
		if (value.length > 256) return 'Password must be less than 256 characters'
	}
}

const AccountCreateModal: React.FC<ModalProps> = ({ modal }) => {
	const dispatch: Dispatch = useDispatch()
	const isMobile = useIsMobile(false)
	const { register, handleSubmit, formState: { errors }, watch, getValues, setValue, reset } = useForm({ reValidateMode: 'onBlur' })
	const [showGenerator, setShowGenerator] = useState(false)
	const [isSubmitting, setSubmitting] = useState(false)

	/* Reset form after closing */
	useEffect(() => reset(), [modal.open, reset])

	useEffect(() => {
		if ((getValues('password')?.length || 0) === 0)
			setShowGenerator(true)
		else
			setShowGenerator(false)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [watch('password')])

	const createPassword = () => {
		const password = generatePassword()
		setValue('password', password)
		copy(password).then(() => {
			toast.show('Copied Password to Clipboard')
		}).catch((error) => {
			toast.show('Failed to copy Password to Clipboard')
		})
	}

	const onSubmit = (data: any) => {
		setSubmitting(true)
		dispatch.accounts.create({
			site: data.site,
			username: data.username,
			address: data.address,
			password: encrypt(data.password),
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
			header='Create Account'
			onClose={isSubmitting ? () => null : modal.onClose}
			isOpen={modal.open}
			size='2xl'
			buttons={<>
				<Button disabled={isSubmitting} variant='ghost' onClick={modal.onClose} mr='3'>Cancel</Button>
				<FormSubmitButton onClick={handleSubmit(onSubmit)} isDisabled={isSubmitting} isLoading={isSubmitting}>Create</FormSubmitButton>
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
					<FormInput autoFocus={!isMobile} isRequired label='Site' register={register} error={errors.site} isDisabled={isSubmitting} validate={validate.site} />
					<FormInput label='Username' register={register} error={errors.username} isDisabled={isSubmitting} validate={validate.username} />
					<FormInput label='Address' register={register} error={errors.address} isDisabled={isSubmitting} validate={validate.address} />
					<FormPasswordInput isRequired endElement={showGenerator ? (
						<IconButton
							aria-label='Generate Password'
							tooltip='Generate Password'
							rIcon={MdVpnKey}
							onClick={createPassword}
						/>
					) : undefined} label='Password' register={register} error={errors.password} isDisabled={isSubmitting} validate={validate.password} />
				</Stack>
			</form>
		</Modal>
	)
}

export default AccountCreateModal