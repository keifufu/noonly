import { DocumentType, Ref, getModelForClass, getName, modelOptions, prop } from '@typegoose/typegoose'

import { FileDlKeyClass } from './FileDlKey.model'
import { FilePermissionsClass } from './FilePermissions.model'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { UserClass } from './User.model'

@modelOptions({ schemaOptions: { collection: 'files' } })
class FileClass extends TimeStamps {
	@prop({ required: true, ref: getName(UserClass) })
	public owner!: Ref<UserClass>

	@prop({ required: true, trim: true, minlength: 1, maxlength: 2048 })
	public name!: string

	@prop({ default: false })
	public isFolder!: boolean

	@prop({ required: true, trim: true })
	public parentId!: string

	@prop({ required: true })
	public size!: number

	@prop({ default: false })
	public trash!: boolean

	@prop({ default: [], ref: getName(FileDlKeyClass) })
	public dlKeys!: Ref<FileDlKeyClass>[]

	@prop({ default: [], ref: getName(UserClass) })
	public invited!: Ref<UserClass>[]

	@prop({ default: [], ref: getName(UserClass) })
	public sharedWith!: Ref<UserClass>[]

	@prop({ default: [], ref: getName(FilePermissionsClass) })
	public permissions!: Ref<FilePermissionsClass>[]
}

const FileModel = getModelForClass(FileClass)
export type FileDocument = DocumentType<FileClass>
export { FileModel as default, FileClass }