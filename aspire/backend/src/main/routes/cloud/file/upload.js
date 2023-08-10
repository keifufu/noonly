import nodePath from 'path'
import mv from 'mv'

import randomID from '#library/utilities/randomID'

export default {
	route: '/cloud/file/upload',
	middleware: true,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		if (!req.files || !req.files.file) return res.reject('Invalid Request')
		const { parent_id } = req.body

		if (typeof parent_id !== 'string' && parent_id !== null) return res.reject('Invalid Request')

		if (parent_id && parent_id !== null && parent_id !== 'null') {
			const [parentFile] = await store.database.cloud.get(parent_id, user.id)
			if (parentFile?.type !== 'folder') return res.reject('Invalid Request')
		}

		const id = await randomID(24, 'cloud')
		const filepath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${user.id}/${id}`)
		mv(req.files.file.path, filepath, () => null)

		await store.database.cloud.insertFile(user.id, req.files.file.name, req.files.file.size, parent_id === 'null' ? null : parent_id || null, id)
		const [file] = await store.database.cloud.get(id, user.id)

		res.sendRes({
			message: 'Uploaded File',
			payload: file
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('CLOUD_CREATE_FILE', { file })
			})
		}
	}
}