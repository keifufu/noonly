import { Checkbox, Stack } from '@chakra-ui/react'

import FormInput from 'library/components/FormInput'
import FormPasswordInput from 'library/components/FormPasswordInput'
import FormSubmitButton from 'library/components/FormSubmitButton'
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
	}
}

const LoginForm: React.FC = () => {
	const isMobile = useIsMobile(false)
	const { register, handleSubmit, formState: { errors } } = useForm({ reValidateMode: 'onBlur' })
	const [isSubmitting, setSubmitting] = useState(false)

	const onSubmit = (data: any) => {
		setSubmitting(true)
		const encryptedPassword = encrypt(data.password, data.password)
		const formData: Noonly.API.Request.AuthLogin = {
			username: data.username,
			password: encryptedPassword,
			rememberMe: data.rememberMe
		}
		post('/auth/login', formData).then((res: Noonly.API.Response.AuthLogin) => {
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
				<Checkbox defaultChecked isDisabled={isSubmitting} {...register('rememberMe')}>Remember me</Checkbox>
				<FormSubmitButton isDisabled={isSubmitting} isLoading={isSubmitting} size='lg'>Sign In</FormSubmitButton>
			</Stack>
		</form>
	)
}

export default LoginForm