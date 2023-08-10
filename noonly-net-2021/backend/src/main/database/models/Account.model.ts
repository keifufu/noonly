import { DocumentType, getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import mongoose from 'mongoose'

@modelOptions({ schemaOptions: { collection: 'accounts' } })
class AccountClass extends TimeStamps {
	@prop({ required: true })
	public ownerId!: mongoose.Schema.Types.ObjectId

	@prop({ required: true, trim: true, minlength: 1, maxlength: 256 })
	public site!: string

	@prop({ required: true, trim: true, minlength: 0, maxlength: 256 })
	public username!: string

	@prop({ required: true, trim: true, minlength: 0, maxlength: 256 })
	public address!: string

	@prop({ required: true, trim: true, minlength: 1, maxlength: 2048 })
	public password!: string

	@prop({ default: false })
	public trash!: boolean

	@prop()
	public icon?: string

	@prop({ default: '', trim: true, minlength: 0, maxlength: 4096 })
	public note!: string

  @prop({ default: null })
  public mfaSecret?: string
}

const AccountModel = getModelForClass(AccountClass)
export type AccountDocument = DocumentType<AccountClass>
export { AccountModel as default, AccountClass }