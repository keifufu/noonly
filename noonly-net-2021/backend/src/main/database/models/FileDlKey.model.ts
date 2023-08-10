import { DocumentType, getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import mongoose from 'mongoose'

@modelOptions({ schemaOptions: { collection: 'filedlkeys' } })
class FileDlKeyClass extends TimeStamps {
	@prop({ required: true })
	public fileId!: mongoose.Schema.Types.ObjectId

	@prop({ required: true })
	public key!: string

	@prop({ default: '', minlength: 0, maxlength: 24 })
	public password!: string
}

const FileDlKeyModel = getModelForClass(FileDlKeyClass)
export type FileDlKeyDocument = DocumentType<FileDlKeyClass>
export { FileDlKeyModel as default, FileDlKeyClass }