import { IsAlphanumeric, IsNotEmpty, IsString, Length } from 'class-validator'

export class TwoFactorBackupCodeDto {
	@IsString()
	@IsNotEmpty()
	@IsAlphanumeric()
	@Length(8)
	backupCode: string
}