import { FormControl, FormErrorMessage, FormLabel, Input, InputGroup, InputProps, InputRightElement } from '@chakra-ui/react'
import { cloneElement, useState } from 'react'
import { FieldError, FieldErrorsImpl, Merge, UseFormRegister } from 'react-hook-form'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

import IconButton from '../IconButton'

interface IProps extends InputProps {
	label: string,
	isRequired?: true,
	autoFocus?: boolean,
	error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined,
	endElement?: JSX.Element,
	register: ((value: string, options: any) => any) | UseFormRegister<any>,
	validate?: (value: string) => string | undefined
}

const FormPasswordInput: React.FC<IProps> = ({ label, isRequired = false, autoFocus = false, error, endElement, register, validate = () => null, ...rest }) => {
	const [type, setType] = useState('password')
	const toggleType = () => setType((type) => (type === 'password' ? 'text' : 'password'))

	return (
		<FormControl isInvalid={!!error?.message} isRequired={isRequired}>
			<FormLabel htmlFor={label}>{label}</FormLabel>
			<InputGroup>
				<InputRightElement>
					{endElement ? cloneElement(endElement, { onKeyDown: (e: React.KeyboardEvent<any>) => e.key !== 'Tab' && document.getElementById(label)?.focus() }) : (
						<IconButton
							onKeyDown={(e) => e.key !== 'Tab' && document.getElementById(label)?.focus()}
							aria-label='Toggle Password Visibility'
							rIcon={type === 'password' ? MdVisibility : MdVisibilityOff}
							onClick={toggleType}
						/>
					)}
				</InputRightElement>
				<Input
					autoFocus={autoFocus}
					id={label}
					type={type}
					{...register(label.toLowerCase(), { required: isRequired, validate })}
					{...rest}
				/>
			</InputGroup>
			<FormErrorMessage>{error?.message}</FormErrorMessage>
		</FormControl>
	)
}

export default FormPasswordInput