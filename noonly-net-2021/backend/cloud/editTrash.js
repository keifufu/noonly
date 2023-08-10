import File from '#schemas/File.schema'
import { advancedTrashValidation } from '#main/database/validate'

export default {
	path: '/cloud/editTrash',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = advancedTrashValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		/* TODO: Is a shared user allowed to move files into owners trash? */
		const updateDatabase = () => new Promise((resolve) => {
			const updated = []
			let processed = 0
			req.body.ids.forEach(async (id) => {
				/* Check permissions */
				const file = await File.findOne({ _id: id }).populate('permissions')
				const isSharedWith = file.sharedWith.includes(req.user.id)
				if (file.owner !== req.user.id && !isSharedWith)
					return res.status(400).json({ error: 'Unauthorized' })

				/* TODO: This right here makes no sense? */
				/* Only Files in folders can be moved by shared users */
				if (!file.isFolder)
					return res.status(400).json({ error: 'How in the fuck did you manage to make this request' })

				if (isSharedWith && !file.permissions.find((e) => e.user === req.user.id)?.canDelete)
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