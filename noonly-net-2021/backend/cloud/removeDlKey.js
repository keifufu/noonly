import { fileDeleteDlKeyValidation } from '#main/database/validate'
import FileDlKey from '#schemas/FileDlKey.schema'
import File from '#schemas/File.schema'

export default {
	path: '/cloud/removeDlKey',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = fileDeleteDlKeyValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		try {
			/* Check permissions */
			const file = await File.findOne({ _id: req.body.id }).populate('permissions')
			const isSharedWith = file.sharedWith.includes(req.user.id)
			if (file.owner !== req.user.id && !isSharedWith)
				return res.status(400).json({ error: 'Unauthorized' })
			if (isSharedWith && !file.permissions.find((e) => e.user === req.user.id)?.canManage)
				return res.status(400).json({ error: 'Missing Permission' })

			/* Delete FileDlKey */
			const result = await FileDlKey.deleteOne({ fileId: file._id, key: req.body.id })

			if (result.deletedCount !== 1)
				return res.status(400).json({ error: 'Something went wrong' })

			const updatedFile = await File.findOne({ _id: req.body.id }).populate('dlKeys')

			res.json({
				message: 'Deleted Key',
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