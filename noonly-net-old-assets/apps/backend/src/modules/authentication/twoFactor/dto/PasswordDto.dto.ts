import { IsString } from 'class-validator'


export class PasswordDto {
	@IsString()
	password: string
}

export default PasswordDto