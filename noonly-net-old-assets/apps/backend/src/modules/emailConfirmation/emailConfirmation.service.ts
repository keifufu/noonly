import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import EmailService from '../email/email.service'
import { UsersService } from '../users/users.service'
import VerificationTokenPayload from './verificationTokenPayload.interface'

@Injectable()
export class EmailConfirmationService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly emailService: EmailService,
		private readonly usersService: UsersService
	) {}

	public sendVerificationLink(email: string) {
		try {
			const payload: VerificationTokenPayload = { email }
			const token = this.jwtService.sign(payload, {
				secret: this.configService.get('JWT_EMAIL_VERIFICATION_TOKEN_SECRET'),
				expiresIn: `${this.configService.get('JWT_EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME')}s`
			})

			const url = `${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}`

			const text = `Please confirm your secondary email address by clicking this link: ${url}`

			return this.emailService.sendMail({
				from: 'noreply@noonly.net',
				to: email,
				subject: 'Confirm your secondary email',
				text
			})
		} catch (error) {
			throw new InternalServerErrorException('Something went wrong')
		}
	}

	public async confirmEmail(email: string) {
		const user = await this.usersService.getUserBySecondaryEmail(email)
		if (user.isSecondaryEmailVerified)
			throw new BadRequestException('Email already confirmed')

		await this.usersService.markSecondaryEmailAsConfirmed(email)
	}

	public async decodeConfirmationToken(token: string) {
		try {
			const payload = await this.jwtService.verify(token, {
				secret: this.configService.get('JWT_EMAIL_VERIFICATION_TOKEN_SECRET')
			})

			if (typeof payload === 'object' && 'email' in payload)
				return payload.email

			throw new BadRequestException()
		} catch (error) {
			if (error?.name === 'TokenExpiredError')
				throw new BadRequestException('Email confirmation token expired')
			throw new BadRequestException('Invalid confirmation token')
		}
	}

	public async resendConfirmationLink(userId: string) {
		const user = await this.usersService.getUserById(userId)
		if (user.isSecondaryEmailVerified)
			throw new BadRequestException('Email already confirmed')
		const { secondaryEmail } = user.toObject()
		await this.sendVerificationLink(secondaryEmail)
	}

	public sendCode(email: string, code: string) {
		return this.emailService.sendMail({
			from: 'noreply@noonly.net',
			to: email,
			subject: `Your code is [${code}]`,
			text: `Your authentication code is: ${code}`
		})
	}
}