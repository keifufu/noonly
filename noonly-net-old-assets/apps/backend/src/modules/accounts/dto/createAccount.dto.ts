import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateAccountDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(256)
	site: string

	@IsString()
	@MaxLength(256)
	username: string

	@IsString()
	@MaxLength(256)
	address: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(2048)
	password: string
}

export default CreateAccountDto