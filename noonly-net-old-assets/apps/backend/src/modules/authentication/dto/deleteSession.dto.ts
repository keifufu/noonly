import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class DeleteSessionDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(24)
	@MaxLength(24)
	sessionId: string
}

export default DeleteSessionDto