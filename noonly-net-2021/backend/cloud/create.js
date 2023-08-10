import { fileCreateValidation } from '#main/database/validate'
import File from '#main/database/schemas/File.schema'
import nodePath from 'path'
import fs from 'fs'

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
	path: '/cloud/create',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = fileCreateValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		try {
			/* Validate ownership of parent Folder */
			if (req.body.parentId !== 'NULL') {
				const parentFolder = await File.findOne({ _id: req.body.parentId, isFolder: false, owner: req.user.id })
				if (!parentFolder) return res.status(400).json({ error: 'Something went wrong' })
			}

			/* Check if file with that name already exists in specified folder */
			const existingFile = await File.findOne({ name: req.body.name, parentId: req.body.parentId, isFolder: req.body.isFolder })
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

				/* Create a new File */
				const file = new File({
					owner: req.user.id,
					name: req.body.name,
					parentId: req.body.parentId,
					isFolder: req.body.isFolder,
					size: 0
				})
				/* No need to populate here, since nothing would end up being populated anyways */
				const savedFile = await file.save()

				/* Create an empty File */
				if (!req.body.isFolder) {
					const filePath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${savedFile._id}`)
					fs.closeSync(fs.openSync(filePath, 'w'))
				}

				deletedId = existingFile._id
				returningFile = savedFile
			} else {
				const name = req.body.appendName ? await findAppendingName(req.body.name) : req.body.name

				const file = new File({
					owner: req.user.id,
					name: name,
					parentId: req.body.parentId,
					isFolder: req.body.isFolder,
					size: 0
				})
				/* No need to populate here, since nothing would end up being populated anyways */
				const savedFile = await file.save()

				/* Create an empty File */
				if (!req.body.isFolder) {
					const filePath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${savedFile._id}`)
					fs.closeSync(fs.openSync(filePath, 'w'))
				}

				returningFile = savedFile
			}

			res.json({
				message: `Created ${req.body.isFolder ? 'Folder' : 'File'}`,
				data: {
					file: returningFile.toClient(),
					deletedId
				}
			})
		} catch (error) {
			console.error(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}
}