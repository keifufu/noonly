import File from '#schemas/File.schema'
import FilePermissions from '#main/database/schemas/FilePermissions.schema'
import { fileCancelInviteValidation } from '#main/database/validate'

export default {
	path: '/cloud/removeUser',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = fileCancelInviteValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		try {
			/* Validate owner of file */
			const file = await File.findOne({ _id: req.body.id, owner: req.user.id })
			if (!file) return res.status(400).json({ error: 'Something went wrong' })

			/* Delete FilePermissions */
			const deletedFilePermissions = await FilePermissions.findOneAndDelete({ fileId: req.body.id, user: req.body.userId })
			if (!deletedFilePermissions) return res.status(400).json({ error: 'Something went wrong' })

			/* Removed user from sharedWith, and remove filePermissions */
			const populateUserWith = 'username avatar'
			const updatedFile = await File.findOneAndUpdate({ _id: req.body.id }, {
				$pull: {
					sharedWith: req.body.userId,
					permissions: deletedFilePermissions._id
				}
			}, { new: true }).populate('sharedWith', populateUserWith).populate('permissions')

			if (!updatedFile)
				res.status(400).json({ error: 'Something went wrong' })

			res.json({
				message: 'Removed User from File',
				data: {
					updated: {
						id: req.body.id,
						sharedWith: updatedFile.sharedWith,
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