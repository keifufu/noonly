import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateAccountDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(256)
	@IsOptional()
	site: string

	@IsString()
	@MaxLength(256)
	@IsOptional()
	username: string

	@IsString()
	@MaxLength(256)
	@IsOptional()
	address: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(2048)
	@IsOptional()
	password: string

	@IsBoolean()
	@IsOptional()
	trash: boolean

	@IsString()
	@MaxLength(4096)
	@IsOptional()
	note: string
}

export default UpdateAccountDto