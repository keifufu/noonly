import { DocumentType, getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import mongoose from 'mongoose'

@modelOptions({ schemaOptions: { collection: 'filepermissions' } })
class FilePermissionsClass extends TimeStamps {
	@prop({ required: true })
	public userId!: mongoose.Schema.Types.ObjectId

	@prop({ required: true })
	public fileId!: mongoose.Schema.Types.ObjectId

	@prop({ default: false })
	public canRename!: boolean

	@prop({ default: false })
	public canEdit!: boolean

	@prop({ default: false })
	public canReplace!: boolean

	@prop({ default: false })
	public canManage!: boolean

	@prop({ default: false })
	public canUpload!: boolean

	@prop({ default: false })
	public canDelete!: boolean

	@prop({ default: false })
	public canMoveFiles!: boolean
}

const FilePermissionsModel = getModelForClass(FilePermissionsClass)
export type FilePermissionsDocument = DocumentType<FilePermissionsClass>
export { FilePermissionsModel as default, FilePermissionsClass }