import File from '#schemas/File.schema'
import FilePermissions from '#main/database/schemas/FilePermissions.schema'
import User from '#main/database/schemas/User.schema'
import { fileSendInviteValidation } from '#main/database/validate'

export default {
	path: '/cloud/sendInvite',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = fileSendInviteValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		try {
			/* Check if invited user exists */
			const user = await User.findOne({ username: req.body.username })
			if (!user)
				res.status(400).json({ error: 'Specified user does not exist' })

			/* Check if File is owned by user */
			const file = await File.findOne({ _id: req.body.id, owner: req.user.id })
			if (!file)
				res.status(400).json({ error: 'Something went wrong' })

			/* Create FilePermissions */
			const filePermissions = new FilePermissions({
				user: user._id,
				file: file._id,
				canRename: req.body.permissions.canRename,
				canEdit: req.body.permissions.canEdit,
				canReplace: req.body.permissions.canReplace,
				canManage: req.body.permissions.canManage,
				canUpload: req.body.permissions.canUpload,
				canDelete: req.body.permissions.canDelete,
				canMoveFiles: req.body.permissions.canMoveFiles
			})
			const savedFilePermissons = await filePermissions.save()

			/* Update File */
			const populateUserWith = 'username avatar'
			const updatedFile = await File.findOneAndUpdate({ _id: req.body.id, owner: req.user.id }, {
				$push: {
					invited: user._id,
					permissions: savedFilePermissons._id
				}
			}, { new: true }).populate('invited', populateUserWith).populate('permissions')

			if (!updatedFile)
				res.status(400).json({ error: 'Something went wrong' })

			res.json({
				message: `Sent an invite to ${user.username}`,
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