import { DocumentType, getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import mongoose from 'mongoose'

@modelOptions({ schemaOptions: { collection: 'screenshots' } })
class ScreenshotClass extends TimeStamps {
	@prop({ required: true })
	public ownerId!: mongoose.Schema.Types.ObjectId

	@prop({ required: true, trim: true, minlength: 10, maxlength: 10 })
	public name!: string

	@prop({ required: true, trim: true })
	public type!: string

	@prop({ required: true })
	public size!: number

	@prop({ default: false })
	public favorite!: boolean

	@prop({ default: false })
	public trash!: boolean
}

const ScreenshotModel = getModelForClass(ScreenshotClass)
export type ScreenshotDocument = DocumentType<ScreenshotClass>
export { ScreenshotModel as default, ScreenshotClass }