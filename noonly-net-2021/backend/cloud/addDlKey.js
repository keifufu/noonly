import File from '#schemas/File.schema'
import FileDlKey from '#schemas/FileDlKey.schema'
import { fileAddDlKeyValidation } from '#main/database/validate'
import randomToken from '#library/utilities/randomToken'

export default {
	path: '/cloud/addDlKey',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = fileAddDlKeyValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		try {
			/* Check permissions */
			const file = await File.findOne({ _id: req.body.id }).populate('permissions')
			const isSharedWith = file.sharedWith.includes(req.user.id)
			if (file.owner !== req.user.id || !isSharedWith)
				return res.status(400).json({ error: 'Unauthorized' })
			if (isSharedWith && !file.permissions.find((e) => e.user === req.user.id)?.canManage)
				return res.status(400).json({ error: 'Missing Permission' })

			/* Create FileDlKey */
			const key = randomToken(10)
			const dlKey = new FileDlKey({
				fileId: file._id,
				key: key,
				password: req.body.password
			})
			const savedDlKey = await dlKey.save()

			if (!savedDlKey)
				return res.status(400).json({ error: 'Something went wrong' })

			/* Update File */
			const updatedFile = await File.findOneAndUpdate({ _id: req.body.id }, {
				$push: {
					dlKeys: savedDlKey._id
				}
			}, { new: true }).populate('dlKeys')

			if (!updatedFile)
				return res.status(400).json({ error: 'Something went wrong' })

			res.json({
				message: 'Created Key',
				data: {
					updated: {
						id: req.body.id,
						dlKeys: updatedFile.dlKeys
					}
				}
			})
		} catch (error) {
			console.error(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}
}