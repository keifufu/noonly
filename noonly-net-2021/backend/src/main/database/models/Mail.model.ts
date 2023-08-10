import { DocumentType, getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

import mongoose from 'mongoose'

@modelOptions({ schemaOptions: { collection: 'mail' } })
class MailClass {
	@prop({ required: true })
	public ownerId!: mongoose.Schema.Types.ObjectId

	@prop({ required: true, trim: true, minlength: 0, maxlength: 2048 })
	public subject!: string

	@prop({ required: true, trim: true, minlength: 0, maxlength: 250 })
	public previewText!: string

	@prop({ required: true, trim: true })
	public from!: string

	@prop({ required: true, trim: true })
	public to!: string

	@prop()
	public sentToAddressId?: mongoose.Schema.Types.ObjectId

	@prop()
	public sentFromAddressId?: mongoose.Schema.Types.ObjectId

	@prop({ trim: true })
	public inReplyTo?: string

	@prop({ default: false })
	public read!: boolean

	@prop({ default: false })
	public trash!: boolean

	@prop({ default: false })
	public archived!: boolean

	@prop({ required: true })
	public dateReceived!: Date

	@prop({ required: true })
	public dateSent!: Date

	@prop({ required: true })
	public messageId!: string
}

const MailModel = getModelForClass(MailClass)
export type MailDocument = DocumentType<MailClass>
export { MailModel as default, MailClass }