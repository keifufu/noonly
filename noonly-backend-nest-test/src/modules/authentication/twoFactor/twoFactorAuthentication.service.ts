import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { Response } from 'express'
import { UserDocument } from 'src/modules/users/user.schema'
import { UsersService } from 'src/modules/users/users.service'
import { authenticator } from 'otplib'
import { toFileStream } from 'qrcode'

@Injectable()
export class TwoFactorAuthenticationService {
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService
	) {}

	public async generateGAuthSecret(user: UserDocument) {
		const secret = authenticator.generateSecret()

		const otpauthUrl = authenticator.keyuri(user.username, this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret)

		await this.usersService.setGAuthSecret(secret, user.id)

		return {
			secret,
			otpauthUrl
		}
	}

	public isGAuthCodeValid(twoFactorAuthenticationCode: string, user: UserDocument) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode.split(' ').join(''),
			secret: user.GAuthSecret
		})
	}

	public pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		stream.setHeader('content-type', 'image/png')
		return toFileStream(stream, otpauthUrl)
	}
}