import { Document, Schema as MongooseSchema } from 'mongoose'
import { Exclude, Type } from 'class-transformer'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Session, SessionDocument } from './session.schema'

@Schema({ collection: 'users', timestamps: true, toJSON: { virtuals: true, getters: true } })
export class User {
	@Prop({ required: true, unique: true, minlength: 4, maxlength: 24 })
	username: string

	@Prop({ required: true, unique: true, minlength: 4, maxlength: 24 })
	@Exclude()
	usernameLowercase: string

	@Prop({ required: true, trim: true, minlength: 1, maxLength: 2048 })
	@Exclude()
	password: string

	@Prop({ required: true, trim: true, minlength: 1, maxLength: 2048 })
	@Exclude()
	passwordEncryptedWithRecoveryCode: string

	@Prop({ required: true })
	@Exclude()
	acceptedTerms: boolean

	@Prop({
		type: [{ type: MongooseSchema.Types.ObjectId, ref: Session.name }],
		default: []
	})
	@Type(() => Session)
	sessions: SessionDocument[]

	@Prop({
		default: null,
		get: (phoneNumber: string) => {
			if (!phoneNumber) return
			const last4Digits = phoneNumber.slice(phoneNumber.length - 4)
			const censoredNumber = '*'.repeat(phoneNumber.length - 4) + last4Digits
			return censoredNumber
		}
	})
	phoneNumber: string

	@Prop({ default: false })
	isPhoneNumberConfirmed: boolean

	@Prop({ default: false })
	usePhoneNumberFor2FA: boolean

	@Prop()
	@Exclude()
	GAuthSecret?: string

	@Prop({ default: false })
	isGAuthEnabled: boolean

	@Prop({
		default: null,
		get: (email: string) => {
			if (!email) return null
			const separatorIndex = email.indexOf('@')
			if (separatorIndex < 3)
				// 'ab@gmail.com' -> '**@gmail.com'
				return email.slice(0, separatorIndex).replace(/./g, '*') + email.slice(separatorIndex)
			// 'test42@gmail.com' -> 'te****@gmail.com'
			return email.slice(0, 2) + email.slice(2, separatorIndex).replace(/./g, '*') + email.slice(separatorIndex)
		}
	})
	secondaryEmail: string

	@Prop({ default: null })
	@Exclude()
	secondaryEmailLowercase: string

	@Prop({ default: false })
	isSecondaryEmailVerified: boolean

	@Prop({ default: [], type: [String] })
	@Exclude()
	backupCodes: string[]
}

export type UserDocument = User & Document
export const UserSchema = SchemaFactory.createForClass(User)