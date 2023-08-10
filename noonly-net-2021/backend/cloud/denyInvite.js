import File from '#schemas/File.schema'
import FilePermissions from '#main/database/schemas/FilePermissions.schema'
import { fileCancelInviteValidation } from '#main/database/validate'

export default {
	path: '/cloud/denyInvite',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = fileCancelInviteValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		try {
			/* Check if invite is valid */
			const file = await File.findOne({ _id: req.body.fileId })
			if (!file || !file.invited.includes(req.user.id))
				res.status(400).json({ error: 'Something went wrong' })

			/* Delete FilePermissions */
			const deletedFilePermissions = await FilePermissions.findOneAndDelete({ fileId: req.body.id, user: req.user.id })
			if (!deletedFilePermissions) return res.status(400).json({ error: 'Something went wrong' })

			/* Removed user from invited, and remove filePermissions */
			const updatedFile = await File.findOneAndUpdate({ _id: req.body.id }, {
				$pull: {
					invited: req.user.id,
					permissions: deletedFilePermissions._id
				}
			}, { new: true })

			if (!updatedFile)
				res.status(400).json({ error: 'Something went wrong' })

			res.json({
				message: 'Denied Invite',
				data: {
					file: {
						id: file._id
					}
				}
			})
		} catch (error) {
			console.error(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}
}