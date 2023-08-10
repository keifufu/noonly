import { IsEmail, IsNotEmpty, IsString, NotContains } from 'class-validator'

export class AddSecondaryEmailDto {
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	@NotContains('@noonly.net', { message: 'Cant use a @noonly.net email as a secondary email' })
	email: string
}

export default AddSecondaryEmailDto