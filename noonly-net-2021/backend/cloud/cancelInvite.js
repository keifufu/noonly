import File from '#schemas/File.schema'
import FilePermissions from '#main/database/schemas/FilePermissions.schema'
import { fileCancelInviteValidation } from '#main/database/validate'

export default {
	path: '/cloud/cancelInvite',
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

			/* Removed user from invited, and remove filePermissions */
			const populateUserWith = 'username avatar'
			const updatedFile = await File.findOneAndUpdate({ _id: req.body.id }, {
				$pull: {
					invited: req.body.userId,
					permissions: deletedFilePermissions._id
				}
			}, { new: true }).populate('invited', populateUserWith).populate('permissions')

			if (!updatedFile)
				res.status(400).json({ error: 'Something went wrong' })

			res.json({
				message: 'Cancelled Invite',
				data: {
					updated: {
						id: req.body.id,
						invited: updatedFile.invited,
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