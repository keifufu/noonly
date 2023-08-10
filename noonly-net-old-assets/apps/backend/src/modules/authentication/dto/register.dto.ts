import { IsBoolean, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(4)
	@MaxLength(24)
	username: string

	@IsString()
	@IsNotEmpty()
	password: string

	@IsString()
	@IsNotEmpty()
	passwordEncryptedWithRecoveryCode: string

	@IsBoolean()
	acceptedTerms: boolean
}

export default RegisterDto