import { Button, ButtonProps } from '@chakra-ui/react'

const FormSubmitButton: React.FC<ButtonProps> = ({ children, ...rest }) => (
	<Button
		type='submit'
		bg='blue.500'
		_hover={{ bg: 'blue.600' }}
		_active={{ bg: 'blue.600' }}
		color='white'
		size='md'
		{...rest}
	>
		{children}
	</Button>
)

export default FormSubmitButton