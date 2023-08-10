import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { Document } from 'mongoose'
import { Exclude } from 'class-transformer'

@Schema({ collection: 'accounts', timestamps: true, toJSON: { virtuals: true } })
export class Account {
	@Prop({ required: true })
	@Exclude()
	ownerId: string

	@Prop({ required: true, trim: true, minlength: 1, maxlength: 256 })
	site: string

	@Prop({ default: '', trim: true, minlength: 0, maxlength: 256 })
	username: string

	@Prop({ default: '', trim: true, minlength: 0, maxlength: 256 })
	address: string

	@Prop({ required: true, trim: true, minlength: 1, maxlength: 2048 })
	password: string

	@Prop({ default: false })
	trash: boolean

	@Prop()
	icon?: string

	@Prop({ default: '', trim: true, minlength: 0, maxlength: 4096 })
	note: string
}

export type AccountDocument = Account & Document
export const AccountSchema = SchemaFactory.createForClass(Account)