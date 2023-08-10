import File from '#schemas/File.schema'
import { fileAcceptInviteValidation } from '#main/database/validate'

export default {
	path: '/cloud/acceptInvite',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = fileAcceptInviteValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		try {
			/* Check if invite is valid */
			const file = await File.findOne({ _id: req.body.fileId })
			if (!file || !file.invited.includes(req.user.id))
				res.status(400).json({ error: 'Something went wrong' })

			/* Update File */
			const populateUserWith = 'username avatar'
			const updatedFile = await File.findOneAndUpdate({ _id: file._id }, {
				$pull: {
					invited: req.user.id
				},
				$push: {
					sharedWith: req.user.id
				}
			/* Populate it, since we send it back to the user that accepted the invite */
			}, { new: true })
				.populate('owner').populate('sharedWith', populateUsersWith).populate('dlKeys').populate('permissions')

			if (!updatedFile)
				res.status(400).json({ error: 'Something went wrong' })

			res.json({
				message: 'Accepted Invite',
				data: {
					file: updatedFile.toClient()
				}
			})
		} catch (error) {
			console.error(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}
}