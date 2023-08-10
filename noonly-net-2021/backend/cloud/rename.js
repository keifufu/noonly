import File from '#schemas/File.schema'
import { fileRenameValidation } from '#main/database/validate'
import fs from 'fs'
import nodePath from 'path'

function findAppendingName(name, currentIndex = 1) {
	return new Promise(async (resolve) => {
		const newName = `${name} (${currentIndex})`
		const file = await File.findOne({ name: newName })
		if (file) {
			const result = await findAppendingName(name, currentIndex + 1)
			resolve(result)
		} else {
			resolve(newName)
		}
	})
}

export default {
	path: '/cloud/rename',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = fileRenameValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		try {
			/* Check permissions */
			const file = await File.findOne({ _id: req.body.id }).populate('permissions')
			const isSharedWith = file.sharedWith.includes(req.user.id)
			if (file.owner.toString() !== req.user.id && !isSharedWith)
				return res.status(400).json({ error: 'Unauthorized' })
			if (isSharedWith && !file.permissions.find((e) => e.user === req.user.id)?.canRename)
				return res.status(400).json({ error: 'Missing Permission' })

			/* Check if file with that name already exists in specified folder */
			const existingFile = await File.findOne({ name: req.body.name, parentId: file.parentId, isFolder: file.isFolder })
			if (existingFile && !req.body.overwriteExisting && !req.body.appendName)
				return res.status(400).json({ error: `A ${existingFile.isFolder ? 'Folder' : 'File'} with this Name already exists` })

			/* Don't allow overwriting Folder */
			if (req.body.overwriteExisting && existingFile?.isFolder)
				return res.status(400).json({ error: 'A Folder with this Name already exists' })

			let returningFile
			let deletedId
			/* This can only be a File */
			if (req.body.overwriteExisting && existingFile) {
				/* Delete the File we are overwriting */
				await File.deleteOne({ _id: existingFile._id })
				const filePath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${existingFile._id}`)
				if (fs.existsSync(filePath))
					fs.rmSync(filePath)

				/* Rename File */
				const updatedFile = await File.findOneAndUpdate({ _id: file._id }, {
					name: req.body.name
				}, { new: true })

				deletedId = existingFile._id
				returningFile = updatedFile
			} else {
				const name = req.body.appendName ? await findAppendingName(req.body.name) : req.body.name

				const updatedFile = await File.findOneAndUpdate({ _id: req.body.id }, {
					name: name
				}, { new: true })

				returningFile = updatedFile
			}

			res.json({
				message: `Renamed ${returningFile.isFolder ? 'Folder' : 'File'}`,
				data: {
					updated: {
						id: returningFile._id,
						name: returningFile.name
					},
					deletedId
				}
			})
		} catch (error) {
			console.error(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}
}