import File from '#schemas/File.schema'
import FilePermissions from '#main/database/schemas/FilePermissions.schema'
import { fileUpdatePermissionsValidation } from '#main/database/validate'

export default {
	path: '/cloud/updatePermissions',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = fileUpdatePermissionsValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		try {
			/* Validate file owner */
			const file = await File.findOne({ _id: req.body.fileId, owner: req.user.id })
			if (!file) return res.status(400).json({ error: 'Something went wrong' })

			/* Update FilePermissions */
			const updatedFilePermissions = await FilePermissions.findOneAndUpdate({
				file: req.body.fileId, user: req.body.userId
			}, {
				canRename: req.body.permissions.canRename,
				canEdit: req.body.permissions.canEdit,
				canReplace: req.body.permissions.canReplace,
				canManage: req.body.permissions.canManage,
				canUpload: req.body.permissions.canUpload,
				canDelete: req.body.permissions.canDelete,
				canMoveFiles: req.body.permissions.canMoveFiles
			}, { new: true })

			if (!updatedFilePermissions)
				return res.status(400).json({ error: 'Something went wrong' })

			/* Get updated File */
			const updatedFile = await File.findOne({ _id: req.body.fileId }).populate('permissions')
			if (!updatedFile) res.status(400).json({ error: 'Something went wrong' })

			res.json({
				message: 'Updated Permissions',
				data: {
					updated: {
						id: req.body.id,
						permissions: updatedFile.permissions
					}
				}
			})
		} catch (error) {
			console.error(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}
}