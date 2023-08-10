import nodePath from 'path'
import mv from 'mv'

import randomID from '#library/utilities/randomID'

export default {
	route: '/cloud/file/userUpload',
	middleware: true,
	type: 'post',
	user: false,
	execute: async (req, res, store) => {
		if (!req.files || !req.files.file) return res.reject('Invalid Request')
		const { parent_id, password } = req.body
		const { token } = req.headers

		if (parent_id && typeof parent_id !== 'string' && parent_id !== null && parent_id !== 'null') return res.reject('Invalid Request')
		if (password && typeof password !== 'string' && password !== null && password !== 'null') return res.reject('Invalid Request')

		const [user] = await store.database.users.getByCloudToken(token)
		if (!user) return res.reject('Invalid Request')

		if (parent_id && parent_id !== null && parent_id !== 'null') {
			const [parentFile] = await store.database.cloud.get(parent_id, user.id)
			if (parentFile?.type !== 'folder') return res.reject('Invalid Request')
		}

		const id = await randomID(24, 'cloud')
		const filepath = nodePath.normalize(`${process.env.DATA_DIR}/cloud/${user.id}/${id}`)
		mv(req.files.file.path, filepath, () => null)

		await store.database.cloud.insertFile(user.id, req.files.file.name, req.files.file.size, parent_id === 'null' ? null : parent_id || null, id)
		const [file] = await store.database.cloud.get(id, user.id)

		const key = await randomID(24, 'cloud_shared')
		await store.database.cloud.insertShared(user.id, id, key, password || null)

		res.sendRes({
			message: 'Uploaded File',
			payload: `https://aspire.icu/dl/${key}`
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('CLOUD_CREATE_FILE', { file })
				socket.emit('CLOUD_SET_SHARED', {
					fileId: file.id,
					sharedKey: key,
					sharedPassword: password || ''
				})
			})
		}
	}
}