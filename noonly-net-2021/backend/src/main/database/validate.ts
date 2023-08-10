// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import Joi from 'joi'

const registerValidation = (data) => {
	const schema = Joi.object({
		username: Joi.string().alphanum().min(4).max(24).required(),
		password: Joi.string().min(1).max(2048).required()
	})
	return schema.validate(data)
}

const loginValidation = (data) => {
	const schema = Joi.object({
		username: Joi.string().alphanum().min(4).max(24).required(),
		password: Joi.string().min(1).max(2048).required(),
		rememberMe: Joi.boolean().required()
	})
	return schema.validate(data)
}

const accountCreateValidation = (data) => {
	const schema = Joi.object({
		site: Joi.string().min(1).max(256).required(),
		username: Joi.string().min(1).max(256).required().allow(''),
		address: Joi.string().min(1).max(256).required().allow(''),
		password: Joi.string().min(1).max(2048).required()
	})
	return schema.validate(data)
}

const accountEditValidation = (data) => {
	const schema = Joi.object({
		site: Joi.string().min(1).max(256).required(),
		username: Joi.string().min(1).max(256).required().allow(''),
		address: Joi.string().min(1).max(256).required().allow(''),
		password: Joi.string().min(1).max(2048).required(),
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	})
	return schema.validate(data)
}

const accountNoteValidation = (data) => {
	const schema = Joi.object({
		note: Joi.string().min(0).max(4096).required().allow(''),
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	})
	return schema.validate(data)
}

const genericTrashValidation = (data) => {
	const schema = Joi.object({
		trash: Joi.boolean().required(),
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	})
	return schema.validate(data)
}

const genericDeleteValidation = (data) => {
	const schema = Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	})
	return schema.validate(data)
}

const genericFavoriteValidation = (data) => {
	const schema = Joi.object({
		favorite: Joi.boolean().required(),
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	})
	return schema.validate(data)
}

const sendMailValidation = (data) => {
	const schema = Joi.object({
		subject: Joi.string().min(1).max(255).required(),
		recipients: Joi.array().min(1).required(),
		text: Joi.string().min(0).required().allow(''),
		html: Joi.string().min(0).required().allow('')
	})
	return schema.validate(data)
}

const addressValidation = (data) => {
	const schema = Joi.object({
		address: Joi.string().min(4).max(24).regex(/^[A-Za-z0-9_.]+$/).custom((value, helper) => {
			if (['.', '_'].includes(value[0]))
				return helper.message('"address" must not start with a . or a _')
			if (['.', '_'].includes(value[value.length - 1]))
				return helper.message('"address" must not end with a . or a _')
			return true
		}).required()
	})
	return schema.validate(data)
}

const addAddressValidation = (data) => {
	const schema = Joi.object({
		address: Joi.string().min(4).max(40).regex(/^[A-Za-z0-9_.]+$/).custom((value, helper) => {
			if (['.', '_'].includes(value[0]))
				return helper.message('"address" must not start with a . or a _')
			if (['.', '_'].includes(value[value.length - 1]))
				return helper.message('"address" must not end with a . or a _')
			return true
		}).required(),
		name: Joi.string().min(1).max(64).alphanum().required()
	})
	return schema.validate(data)
}

const advancedTrashValidation = (data) => {
	const schema = Joi.object({
		trash: Joi.boolean().required(),
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
	})
	return schema.validate(data)
}

const advancedDeleteValidation = (data) => {
	const schema = Joi.object({
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
	})
	return schema.validate(data)
}

const advancedFavoriteValidation = (data) => {
	const schema = Joi.object({
		favorite: Joi.boolean().required(),
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
	})
	return schema.validate(data)
}

const advancedArchivedValidation = (data) => {
	const schema = Joi.object({
		archived: Joi.boolean().required(),
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
	})
	return schema.validate(data)
}

const advancedReadValidation = (data) => {
	const schema = Joi.object({
		read: Joi.boolean().required(),
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
	})
	return schema.validate(data)
}

const accountIconValidation = (data) => {
	const schema = Joi.object({
		site: Joi.string().min(1).required()
	})
	return schema.validate(data)
}

const userStatusValidation = (data) => {
	const schema = Joi.object({
		status: Joi.string().custom((value, helper) => {
			if (!['Online', 'Idle', 'Do not disturb', 'Invisible'].includes(value))
				return helper.message('Invalid status')
			return true
		})
	})
	return schema.validate(data)
}

const simpleIdValidation = (data) => {
	const schema = Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	})
	return schema.validate(data)
}

const updateAddressesValidation = (data) => {
	const schema = Joi.object({
		order: Joi.object().pattern(Joi.string().regex(/^[0-9a-fA-F]{24}$/), Joi.number()).required(),
		visible: Joi.object().pattern(Joi.string().regex(/^[0-9a-fA-F]{24}$/), Joi.boolean()).required()
	})
	return schema.validate(data)
}

const editAddressNameValidation = (data) => {
	const schema = Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		name: Joi.string().min(1).max(64).alphanum().required()
	})
	return schema.validate(data)
}

const deleteIconValidation = (data) => {
	const schema = Joi.object({
		/* Don't know the exact details and i don't really give a shit */
		icon: Joi.string().required()
	})
	return schema.validate(data)
}

const editIconValidation = (data) => {
	const schema = Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		icon: Joi.string().allow(null).required()
	})
	return schema.validate(data)
}

const fileRenameValidation = (data) => {
	const schema = Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		name: Joi.string().min(1).max(2048).required(),
		overwriteExisting: Joi.boolean().required(),
		appendName: Joi.boolean().required()
	})
	return schema.validate(data)
}

const fileEditParentValidation = (data) => {
	const schema = Joi.object({
		ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required(),
		parentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().allow('NULL')
	})
	return schema.validate(data)
}

const fileAddDlKeyValidation = (data) => {
	const schema = Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		password: Joi.string().min(0).max(24).required()
	})
	return schema.validate(data)
}

const fileUpdateDlKeyValidation = (data) => {
	const schema = Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		key: Joi.string().length(10).required(),
		password: Joi.string().min(0).max(24).required()
	})
	return schema.validate(data)
}

const fileDeleteDlKeyValidation = (data) => {
	const schema = Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		key: Joi.string().length(10).required()
	})
	return schema.validate(data)
}

const fileSendInviteValidation = (data) => {
	const schema = Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		username: Joi.string().alphanum().min(4).max(24).required(),
		permissions: Joi.object({
			canRename: Joi.boolean().required(),
			canEdit: Joi.boolean().required(),
			canReplace: Joi.boolean().required(),
			canManage: Joi.boolean().required(),
			canUpload: Joi.boolean().required(),
			canDelete: Joi.boolean().required(),
			canMoveFiles: Joi.boolean().required()
		}).required()
	})
	return schema.validate(data)
}

const fileCancelInviteValidation = (data) => {
	const schema = Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	})
	return schema.validate(data)
}

const fileAcceptInviteValidation = (data) => {
	const schema = Joi.object({
		fileId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	})
	return schema.validate(data)
}

const fileUpdatePermissionsValidation = (data) => {
	const schema = Joi.object({
		fileId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		permissions: Joi.object({
			canRename: Joi.boolean().required(),
			canEdit: Joi.boolean().required(),
			canReplace: Joi.boolean().required(),
			canManage: Joi.boolean().required(),
			canUpload: Joi.boolean().required(),
			canDelete: Joi.boolean().required(),
			canMoveFiles: Joi.boolean().required()
		}).required()
	})
	return schema.validate(data)
}

const fileUploadValidation = (data) => {
	const schema = Joi.object({
		parentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().allow('NULL')
	})
	return schema.validate(data)
}

const fileCreateValidation = (data) => {
	const schema = Joi.object({
		parentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().allow('NULL'),
		name: Joi.string().min(1).max(2048).required(),
		isFolder: Joi.boolean().required(),
		overwriteExisting: Joi.boolean().required(),
		appendName: Joi.boolean().required()
	})
	return schema.validate(data)
}

const mailDownloadAttachmentValidation = (data) => {
	const schema = Joi.object({
		mailId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		attachmentId: Joi.string().regex(/^[0-9a-zA-Z]{24}$/).required()
	})
	return schema.validate(data)
}

export { registerValidation, loginValidation, accountCreateValidation, accountEditValidation, accountNoteValidation,
	genericTrashValidation, genericDeleteValidation, genericFavoriteValidation, sendMailValidation, addressValidation,
	advancedArchivedValidation, advancedReadValidation, advancedTrashValidation, advancedDeleteValidation,
	advancedFavoriteValidation, accountIconValidation, userStatusValidation, simpleIdValidation, addAddressValidation,
	updateAddressesValidation, editAddressNameValidation, deleteIconValidation, editIconValidation, fileRenameValidation,
	fileEditParentValidation, fileAddDlKeyValidation, fileUpdateDlKeyValidation, fileDeleteDlKeyValidation, fileSendInviteValidation,
	fileCancelInviteValidation, fileAcceptInviteValidation, fileUpdatePermissionsValidation, fileUploadValidation, fileCreateValidation,
	mailDownloadAttachmentValidation }