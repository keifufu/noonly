import { fileUploadValidation } from '#main/database/validate'
import File from '#main/database/schemas/File.schema'
import nodePath from 'path'
import fs from 'fs'
import mv from 'mv'

export default {
	path: '/cloud/upload',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		if (!req.files || !req.files.file)
			return res.status(400).json({ error: 'No file was uploaded' })

		const { error } = fileUploadValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		try {
			/* Validate ownership of parent Folder */
			if (req.body.parentId !== 'NULL') {
				const parentFolder = await File.findOne({ _id: req.body.parentId, isFolder: false, owner: req.user.id })
				if (!parentFolder) return res.status(400).json({ error: 'Something went wrong' })
			}

			/* Check if file with that name already exists in specified folder */
			const existingFile = await File.findOne({ name: req.files.file.name, parentId: req.body.parentId })
			if (existingFile)
				return res.status(400).json({ error: 'A File with that Name already exists in that Folder' })

			const file = new File({
				owner: req.user.id,
				name: req.files.file.name,
				parentId: req.body.parentId,
				size: fs.statSync(req.files.file.path).size
			})
			/* No need to populate here, since nothing would end up being populated anyways */
			const savedFile = await file.save()

			const filePath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${savedFile._id}`)
			mv(req.files.file.path, filePath, () => null)

			res.json({
				message: '',
				data: {
					file: savedFile.toClient()
				}
			})
		} catch (error) {
			console.error(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}
}