import File from '#schemas/File.schema'
import { fileEditParentValidation } from '#main/database/validate'

export default {
	path: '/cloud/editParent',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = fileEditParentValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		/* TODO: check if the parentId exists and is also owned by the same user. */

		const updateDatabase = () => new Promise((resolve) => {
			const updated = []
			let processed = 0
			req.body.ids.forEach(async (id) => {
				/* Check permissions */
				const file = await File.findOne({ _id: id }).populate('permissions')
				const isSharedWith = file.sharedWith.includes(req.user.id)
				if (file.owner !== req.user.id || isSharedWith)
					return res.status(400).json({ error: 'Unauthorized' })
				/* Only Files in folders can be moved by shared users */
				if (!file.isFolder)
					return res.status(400).json({ error: 'How in the fuck did you manage to make this request' })
				if (isSharedWith && !file.permissions.find((e) => e.user === req.user.id)?.canMoveFiles)
					return res.status(400).json({ error: 'Missing Permission' })

				/* Edit the parentId */
				processed += 1
				const updatedFile = await File.findOneAndUpdate({ _id: req.body.id }, {
					parentId: req.body.parentId
				}, { new: true })

				/* File failed to update, dont add to `updated` array */
				if (updatedFile) return

				updated.push(id)
				if (processed === req.body.ids.length)
					resolve(updated)
			})
		})

		try {
			const updated = await updateDatabase()

			res.json({
				message: `Moved ${updated.length} Items`,
				data: {
					updated: {
						ids: req.body.ids,
						parentId: req.body.parentId
					}
				}
			})
		} catch (error) {
			console.error(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}
}