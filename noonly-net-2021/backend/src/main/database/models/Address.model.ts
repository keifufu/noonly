import { DocumentType, getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

import mongoose from 'mongoose'

@modelOptions({ schemaOptions: { collection: 'addresses' } })
class AddressClass {
	@prop()
	public ownerId?: mongoose.Schema.Types.ObjectId

	@prop({ required: true, trim: true, minlength: 4, maxlength: 40 })
	public address!: string

	@prop({ required: true, trim: true, minlength: 4, maxlength: 40 })
	public addressLowercase!: string

	@prop({ required: true, trim: true, minlength: 4, maxlength: 64 })
	public name!: string

	@prop({ required: true, min: 0 })
	public order!: number

	@prop({ default: true })
	public visible!: boolean
}

const AddressModel = getModelForClass(AddressClass)
export type AddressDocument = DocumentType<AddressClass>
export { AddressModel as default, AddressClass }