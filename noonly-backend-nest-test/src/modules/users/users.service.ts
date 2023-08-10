import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import mongoose, { Connection, Model } from 'mongoose'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber'
import { User, UserDocument } from './user.schema'
import { Session, SessionDocument } from './session.schema'
import { sha256 } from 'js-sha256'
import * as geoip from 'geoip-lite'
import * as iso3166 from 'iso-3166-2'

import CreateUserDto from './dto/createUser.dto'
import randomToken from 'src/utils/randomToken'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
		@InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>,
		@InjectConnection() private readonly connection: Connection,
		private readonly configService: ConfigService
	) { }

	// @Timeout('sessions', 3 * 1000)
	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'sessions' })
	async handleCron() {
		// Delete expired authenticated sessions
		const expiryTime = this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
		const expiryDate = new Date(Date.now() - (expiryTime * 1000))
		const expiredSessions = await this.sessionModel.find({ updatedAt: { $lt: expiryDate }, authenticatedSession: true }, { userId: 1, authenticatedSession: 1, updatedAt: 1 })
		for (let i = 0; i < expiredSessions.length; i++) {
			const session = expiredSessions[i]
			await this.sessionModel.deleteOne({ _id: session.id })
			await this.update(session.userId, { $pull: { sessions: session.id } })
		}
		// Delete unauthorized sessions older than 6 hours
		const unauthorizedExpiryDate = new Date(Date.now() - (1000 * 60 * 60 * 6))
		const expiredUnauthorizedSessions = await this.sessionModel.find({ updatedAt: { $lt: unauthorizedExpiryDate }, authenticatedSession: false })
		for (let i = 0; i < expiredUnauthorizedSessions.length; i++) {
			const session = expiredUnauthorizedSessions[i]
			await this.sessionModel.deleteOne({ _id: session.id })
			await this.update(session.userId, { $pull: { sessions: session.id } })
		}
	}

	async create(createUserDto: CreateUserDto) {
		const userExists = await this.getUserByUsername(createUserDto.username)
		if (userExists)
			throw new ConflictException('Username is already in use')

		// const formattedPhoneNumber = this.formatPhoneNumber(createUserDto.phoneNumber)
		// const phoneNumberRegistered = await this.getUserByPhoneNumber(formattedPhoneNumber)
		// if (phoneNumberRegistered)
		// 	throw new ConflictException('Phone number already registered')

		const backupCodes = []
		for (let i = 0; i < 8; i++)
			backupCodes.push(randomToken(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'))

		const newUser = new this.userModel({
			...createUserDto,
			usernameLowercase: createUserDto.username.toLowerCase(),
			backupCodes
		})

		try {
			const createdUser = await newUser.save()
			return createdUser
		} catch (error) {
			throw new InternalServerErrorException(error)
		}
	}

	async getUserByUsername(username: string) {
		try {
			const user = await this.userModel.findOne({ usernameLowercase: username.toLowerCase() }).populate('sessions')
			return user
		} catch (error) {
			throw new InternalServerErrorException(error)
		}
	}

	async getUserById(id: string) {
		try {
			const user = await this.userModel.findById({ _id: id }).populate('sessions')
			if (!user)
				throw new NotFoundException('A user with this id does not exist')

			return user
		} catch (error) {
			throw new InternalServerErrorException(error)
		}
	}

	async getUserBySecondaryEmail(secondaryEmail: string) {
		try {
			const user = await this.userModel.findOne({ secondaryEmailLowercase: secondaryEmail.toLowerCase() })
			if (!user)
				throw new NotFoundException('A user with this email was not found')

			return user
		} catch (error) {
			throw new InternalServerErrorException(error)
		}
	}

	markSecondaryEmailAsConfirmed(secondaryEmail: string) {
		return this.userModel.updateOne({ secondaryEmailLowercase: secondaryEmail.toLowerCase() }, {
			isSecondaryEmailVerified: true
		})
	}

	private formatPhoneNumber(phoneNumber: string) {
		const util = PhoneNumberUtil.getInstance()
		const number = util.parse(phoneNumber)
		if (!util.isValidNumber(number))
			throw new BadRequestException('Invalid phone number')
		return util.format(number, PhoneNumberFormat.E164)
	}

	async getUserByPhoneNumber(phoneNumber: string) {
		const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber)
		try {
			const user = await this.userModel.findOne({ phoneNumber: formattedPhoneNumber })
			return user
		} catch (error) {
			throw new InternalServerErrorException(error)
		}
	}

	private update(userId: string | mongoose.Schema.Types.ObjectId, update: any) {
		try {
			return this.userModel.findOneAndUpdate({ _id: userId }, update, { new: true })
		} catch (error) {
			throw new InternalServerErrorException(error)
		}
	}

	async createSession(refreshToken: string, userAgent: string, ipAddress: string, userId: string, authenticatedSession: boolean) {
		const dbSession = await this.connection.startSession()
		dbSession.startTransaction()
		try {
			const geo = geoip.lookup(ipAddress)
			const iso = iso3166.subdivision(geo.country, geo.region)
			const location = `${geo.city}, ${iso.name}, ${iso.countryName}`
			// using sha256 here because we need the output of the hash to always be the same
			const hashedRefreshToken = sha256(refreshToken)
			const session = new this.sessionModel({
				userAgent,
				ipAddress,
				hashedRefreshToken,
				location,
				authenticatedSession,
				userId
			})
			const savedSession = await session.save()
			await this.userModel.updateOne({ _id: userId }, { $push: { sessions: savedSession.id } })
			await dbSession.commitTransaction()
			return savedSession
		} catch (error) {
			await dbSession.abortTransaction()
			throw new InternalServerErrorException('Failed to create a new session')
		} finally {
			dbSession.endSession()
		}
	}

	async removeSession(userId: string, refreshTokenOrId: string) {
		const dbSession = await this.connection.startSession()
		dbSession.startTransaction()
		try {
			const isId = refreshTokenOrId.length === 24
			const query = isId ? { _id: refreshTokenOrId } : { hashedRefreshToken: sha256(refreshTokenOrId) }
			const session = await this.sessionModel.findOneAndDelete(query)
			await this.userModel.updateOne({ _id: userId }, { $pull: { sessions: session._id } })
			await dbSession.commitTransaction()
		} catch (error) {
			await dbSession.abortTransaction()
			throw new InternalServerErrorException('Failed to remove session')
		} finally {
			dbSession.endSession()
		}
	}

	authenticateSession(sessionId: string) {
		return this.sessionModel.updateOne({ _id: sessionId }, {
			authenticatedSession: true
		})
	}

	async getUserIfSessionExists(refreshToken: string, userId: string) {
		const hashedRefreshToken = sha256(refreshToken)
		const session = await this.sessionModel.findOne({ hashedRefreshToken })

		if (session)
			return await this.getUserById(userId)
	}

	refreshSessionById(sessionId: string, refreshToken: string) {
		return this.sessionModel.updateOne({ _id: sessionId }, {
			hashedRefreshToken: sha256(refreshToken)
		})
	}

	setGAuthSecret(secret: string, userId: string) {
		return this.update(userId, {
			GAuthSecret: secret
		})
	}

	enableGAuth(userId: string) {
		return this.update(userId, {
			isGAuthEnabled: true
		})
	}

	disableGAuth(userId: string) {
		return this.update(userId, {
			isGAuthEnabled: false,
			GAuthSecret: null
		})
	}

	markPhoneNumberAsConfirmed(userId: string) {
		return this.update(userId, {
			isPhoneNumberConfirmed: true
		})
	}

	addSecondaryEmail(userId: string, secondaryEmail: string) {
		return this.update(userId, {
			secondaryEmail: secondaryEmail,
			secondaryEmailLowercase: secondaryEmail.toLowerCase(),
			isSecondaryEmailVerified: false
		})
	}

	removeSecondaryEmail(userId: string) {
		return this.update(userId, {
			secondaryEmail: null,
			secondaryEmailLowercase: null,
			isSecondaryEmailVerified: false
		})
	}

	turnOnSmsAuthentication(userId: string) {
		return this.update(userId, {
			usePhoneNumberFor2FA: true
		})
	}

	turnOffSmsAuthentication(userId: string) {
		return this.update(userId, {
			usePhoneNumberFor2FA: false
		})
	}

	async generateNewBackupCodes(userId: string) {
		const backupCodes = []
		for (let i = 0; i < 8; i++)
			backupCodes.push(randomToken(8, 'abcdefghijklmnopqrstuvwxyz0123456789'))
		await this.update(userId, { backupCodes })
		return backupCodes
	}

	async validateBackupCode(userId: string, backupCode: string) {
		const user = await this.getUserById(userId)
		if (!user.backupCodes.includes(backupCode))
			throw new BadRequestException('Invalid or expired backup code')

		const newBackupCode = randomToken(8, 'abcdefghijklmnopqrstuvwxyz0123456789')
		await this.update(userId, { $pull: { backupCodes: backupCode } })
		await this.update(userId, { $push: { backupCodes: newBackupCode } })
	}
}