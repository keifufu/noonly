import File from '#schemas/File.schema'

export default {
	path: '/cloud/clearTrash',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		try {
			const query = { trash: true, owner: req.user.id }
			const filesToDelete = await File.find(query)
			const ids = filesToDelete.map((e) => e.id)
			await File.deleteMany(query)

			res.json({
				message: 'Cleared Trash',
				data: {
					deleted: { ids }
				}
			})
		} catch (error) {
			console.error(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}
}