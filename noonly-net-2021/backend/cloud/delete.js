import { advancedDeleteValidation } from '#main/database/validate'
import File from '#schemas/File.schema'

export default {
	path: '/cloud/delete',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const { error } = advancedDeleteValidation(req.body)
		if (error)
			return res.status(400).json({ error: error.details[0].message })

		const updateDatabase = () => new Promise((resolve) => {
			const deleted = []
			let processed = 0
			req.body.ids.forEach(async (id) => {
				/* Check permissions */
				const file = await File.findOne({ _id: id }).populate('permissions')
				const isSharedWith = file.sharedWith.includes(req.user.id)
				if (file.owner !== req.user.id && !isSharedWith)
					return res.status(400).json({ error: 'Unauthorized' })
				if (isSharedWith && !file.permissions.find((e) => e.user === req.user.id)?.canDelete)
					return res.status(400).json({ error: 'Missing Permission' })

				/* Delete the File */
				const result = await File.deleteOne({ _id: req.body.id })
				processed += 1

				/* File failed to delete, dont add to `deleted` array */
				if (result.deletedCount !== 1) return

				deleted.push(id)
				if (processed === req.body.ids.length)
					resolve(deleted)
			})
		})

		try {
			const deleted = await updateDatabase()

			res.json({
				message: `Deleted ${deleted.length} Items`,
				data: {
					deleted: {
						ids: req.body.ids
					}
				}
			})
		} catch (error) {
			console.error(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}
}