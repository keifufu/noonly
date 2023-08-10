import nodePath from 'path'
import fs from 'fs'

export default {
	route: '/cloud/getImageData',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { id } = req.body

		if (typeof id !== 'string') return res.reject('Invalid Request')

		const [file] = await store.database.cloud.get(id, user.id)
		if (!file) return res.reject('Invalid Request')

		const filepath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${user.id}/${file.id}`)
		if (!fs.existsSync(filepath)) return res.reject()

		const base64 = fs.readFileSync(filepath, { encoding: 'base64' })
		const base64Image = `data:image/${nodePath.extname(file.name).replace('.', '')};base64,${base64}`

		res.sendRes({
			payload: base64Image
		})
	}
}