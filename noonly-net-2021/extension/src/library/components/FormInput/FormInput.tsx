import { FormControl, FormErrorMessage, FormLabel, Input, InputGroup, InputProps } from '@chakra-ui/react'
import { FieldError, FieldErrorsImpl, Merge, UseFormRegister } from 'react-hook-form'

interface IProps extends InputProps {
  valueName?: string,
	label: string,
	rightElement?: JSX.Element,
	isRequired?: true,
	autoFocus?: boolean,
	error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined,
	register: ((value: string, options: any) => any) | UseFormRegister<any>,
	validate?: (value: string) => string | undefined
}

const FormInput: React.FC<IProps> = ({ valueName, label, rightElement, isRequired = false, autoFocus = false, error, register, validate = () => null, ...rest }) => (
	<FormControl isInvalid={!!error?.message} isRequired={isRequired}>
		<FormLabel htmlFor={label}>{label}</FormLabel>
		<InputGroup>
			<Input
				autoFocus={autoFocus}
				id={label}
				{...register(valueName || label.toLowerCase(), { required: isRequired, validate })}
				{...rest}
			/>
			{rightElement && rightElement}
		</InputGroup>
		<FormErrorMessage>{error?.message}</FormErrorMessage>
	</FormControl>
)

export default FormInput