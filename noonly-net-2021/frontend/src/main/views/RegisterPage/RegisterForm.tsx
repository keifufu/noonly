import FormInput from 'library/components/FormInput'
import FormPasswordInput from 'library/components/FormPasswordInput'
import FormSubmitButton from 'library/components/FormSubmitButton'
import { Stack } from '@chakra-ui/react'
import encrypt from 'library/utilities/encrypt'
import post from 'main/axios/post'
import storage from 'library/utilities/storage'
import toast from 'library/utilities/toast'
import { useForm } from 'react-hook-form'
import useIsMobile from 'library/hooks/useIsMobile'
import { useState } from 'react'

const validate = {
	username: (value: string) => {
		if (value.length < 4) return 'Name must be at least 4 characters'
		if (value.length > 24) return 'Name must be less than 24 characters'
	},
	password: (value: string) => {
		if (value.length < 4) return 'Password must be at least 4 characters'
	},
	repeatpass: (value: string, password: string) => {
		if (value !== password) return 'Passwords must match'
	}
}

const RegisterForm: React.FC = () => {
	const isMobile = useIsMobile(false)
	const { register, handleSubmit, formState: { errors }, getValues } = useForm({ reValidateMode: 'onBlur' })
	const [isSubmitting, setSubmitting] = useState(false)

	const onSubmit = (data: any) => {
		setSubmitting(true)
		const encryptedPassword = encrypt(data.password, data.password)
		const formData: Noonly.API.Request.AuthRegister = {
			username: data.username,
			password: encryptedPassword
		}
		post('/auth/register', formData).then((res: Noonly.API.Response.AuthRegister) => {
			setSubmitting(false)
			storage.setItem('jwtToken', res.data.token)
			storage.setItem('encrypted_password', encrypt(data.password, data.username.toLowerCase()))
			window.location.reload()
		}).catch((error) => {
			setSubmitting(false)
			toast.showError(error.message)
		})
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack spacing='6'>
				<FormInput autoFocus={!isMobile} isRequired label='Username' register={register} error={errors.username} isDisabled={isSubmitting} validate={validate.username} />
				<FormPasswordInput isRequired label='Password' register={register} error={errors.password} isDisabled={isSubmitting} validate={validate.password} />
				<FormPasswordInput isRequired label='Repeat Password' register={register}
					error={errors.repeatpass} isDisabled={isSubmitting} validate={(val) => validate.repeatpass(val, getValues('password'))} />
				<FormSubmitButton isDisabled={isSubmitting} isLoading={isSubmitting} size='lg'>Sign Up</FormSubmitButton>
			</Stack>
		</form>
	)
}

export default RegisterForm