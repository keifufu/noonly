/* eslint-disable no-unused-vars */

import { DocumentType, Ref, getModelForClass, getName, modelOptions, prop } from '@typegoose/typegoose'

import { AddressClass } from './Address.model'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

export enum UserStatus {
	ONLINE = 'Online',
	IDLE = 'Idle',
	DO_NOT_DISTURB = 'Do not disturb',
	INVISIBLE = 'Invisible'
}

@modelOptions({ schemaOptions: { collection: 'users' } })
class UserClass extends TimeStamps {
	@prop({ required: true, trim: true, minlength: 4, maxlength: 24 })
	public username!: string

	@prop({ required: true, trim: true, minlength: 4, maxlength: 24 })
	public usernameLowercase!: string

	@prop({ required: true, trim: true, minlength: 1, maxLength: 2048 })
	public password!: string

	@prop({ default: 0 })
	public level!: number

	@prop()
	public avatar?: string

	@prop({ enum: Object.values(UserStatus), default: UserStatus.ONLINE })
	public status!: UserStatus

	@prop({ type: String, default: [] })
	public icons!: string[]

	@prop({ minlength: 10, maxlength: 10 })
	public imgToken!: string

	@prop({ minlength: 10, maxlength: 10 })
	public cloudToken!: string

	@prop({ default: [], ref: getName(AddressClass) })
	public addresses!: Ref<AddressClass>[]

	@prop({ default: '{}', minlength: 2 })
	public settings!: string
}

const UserModel = getModelForClass(UserClass)
export type UserDocument = DocumentType<UserClass>
export { UserModel as default, UserClass }