// Example on getting a users shared files, i think? (this is an old comment i found, before i wrote the code below)

// const query = { sharedWith: { $all: [req.user.id] } }

export default {
	event: 'LOAD_FILES',
	exec: async (data, socket) => {
		// const populateUserWith = 'username avatar'
		// const _files = await File.find({ owner: socket.user.id })
		// 	.populate('dlKeys').populate('invited', populateUserWith).populate('sharedWith', populateUserWith).populate('permissions')
		// const files = _files.map((e) => e.toClient())
		// // eslint-disable-next-line no-return-assign, no-sequences
		// const filesObj = files.reduce((acc, curr) => (acc[curr.id] = curr, acc), {})

		// /* Get Shared Files */
		// const _sharedFiles = await File.find({ sharedWith: [socket.user.id] })
		// 	.populate('owner').populate('sharedWith').populate('dlKeys').populate('permissions')
		// const sharedFiles = _sharedFiles.map((e) => e.toClient())
		// // eslint-disable-next-line no-return-assign, no-sequences
		// const sharedFilesObj = sharedFiles.reduce((acc, curr) => (acc[curr.id] = curr, acc), {})

		// /* Get Invites */
		// const _invitedFiles = await File.find({ invited: [socket.user.id] })
		// 	.populate('owner')
		// const invitedFiles = _invitedFiles.map((file) => ({
		// 	id: file.id,
		// 	name: file.name,
		// 	isFolder: file.isFolder,
		// 	owner: {
		// 		username: file.owner.username,
		// 		avatar: file.owner.avatar
		// 	}
		// }))
		// // eslint-disable-next-line no-return-assign, no-sequences
		// const invitedFilesObj = invitedFiles.reduce((acc, curr) => (acc[curr.id] = curr, acc), {})

		/*
		 * socket.emit('FILES_LOADED', {
		 * 	files: { ...filesObj, ...sharedFilesObj },
		 * 	invitedFiles: invitedFilesObj
		 * })
		 */
	}
} as Noonly.Socket.SocketHandler