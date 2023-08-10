import randomToken from 'library/utilities/randomToken'
import download from 'main/axios/download'
import { saveAs } from 'file-saver'
import post from 'main/axios/post'
import socket from 'main/socket'
import rfdc from 'rfdc'
const clone = rfdc()

export default {
	state: {
		transfers: {},
		expandTransfers: true,
		cachedImages: {}
	},
	reducers: {
		set: (state, payload) => ({
			...payload,
			transfers: state.transfers,
			expandTransfers: state.expandTransfers,
			cachedImages: state.cachedImages
		}),
		add: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.id] = payload
			return clonedState
		},
		rename: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.id].name = payload.name
			return clonedState
		},
		setTransfersExpanded: (state, payload) => ({
			...state,
			expandTransfers: payload
		}),
		setTransfer: (state, payload) => {
			const clonedState = clone(state.transfers)
			clonedState[payload.id] = payload
			return {
				...state,
				transfers: clonedState
			}
		},
		removeTransfer: (state, payload) => {
			const clonedState = clone(state.transfers)
			delete clonedState[payload.id]
			return {
				...state,
				transfers: clonedState
			}
		},
		addCachedImage: (state, payload) => {
			const clonedState = clone(state.cachedImages)
			clonedState[payload.id] = payload.base64Image
			return {
				...state,
				cachedImages: clonedState
			}
		},
		_setTrash: (state, payload) => {
			const clonedState = clone(state)
			const setTrash = (ids) => {
				ids.forEach((id) => {
					const file = clonedState[id]
					if (file.type === 'folder') {
						const files = Object.values(clonedState).filter((e) => e.parent_id === file.id)
						setTrash(files.map((e) => e.id))
					}
					file.trash = payload.trash
				})
			}
			setTrash(payload.ids)
			return clonedState
		},
		_setParentId: (state, payload) => {
			const clonedState = clone(state)
			payload.ids.forEach((id) => {
				clonedState[id].parent_id = payload.parent_id
			})
			return clonedState
		},
		_delete: (state, payload) => {
			const clonedState = clone(state)

			const deleteChildrenRecursive = (parent_id) => {
				const children = Object.values(clonedState).filter((e) => e.parent_id === parent_id)
				children.forEach((file) => {
					deleteChildrenRecursive(file.id)
					delete clonedState[file.id]
				})
				delete clonedState[parent_id]
			}

			payload.ids.forEach((id) => {
				deleteChildrenRecursive(id)
			})
			return clonedState
		},
		_setShared: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.fileId].sharedKey = payload.sharedKey
			clonedState[payload.fileId].sharedPassword = payload.sharedPassword
			return clonedState
		}
	},
	effects: (dispatch) => ({
		refresh: () => {
			socket.emit('FETCH_CLOUD')
		},
		clearTrash: ({ onSuccess, onFail }) => {
			post('/cloud/clearTrash').then((res) => {
				dispatch.mail.remove(res.payload)
				dispatch.notifications.add(res.message)
				onSuccess()
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
				onFail()
			})
		},
		createFolder: ({ name, parent_id, onSuccess, onFail }) => {
			const formData = { name, parent_id }
			post('/cloud/folder/create', formData).then((res) => {
				dispatch.cloud.add(res.payload)
				dispatch.notifications.add(res.message)
				onSuccess()
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
				onFail()
			})
		},
		createFile: ({ name, parent_id, onSuccess, onFail }) => {
			const formData = { name, parent_id }
			post('/cloud/file/create', formData).then((res) => {
				dispatch.cloud.add(res.payload)
				dispatch.notifications.add(res.message)
				onSuccess()
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
				onFail()
			})
		},
		renameFile: ({ id, name, currentName, onSuccess, onFail, _redo, _id }) => {
			const formData = { id, name }
			post('/cloud/rename', formData).then((res) => {
				dispatch.cloud.rename(res.payload)
				const notificationID = randomToken(7)
				dispatch.notifications.add({
					id: _id || notificationID,
					text: res.message,
					button: _redo ? 'Redo' : 'Undo',
					onClick: () => {
						dispatch.cloud.renameFile({
							id,
							name: currentName,
							currentName: name,
							_redo: !_redo,
							_id: _id || notificationID
						})
					}
				})
				if (typeof onSuccess === 'function')
					onSuccess()
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
				if (typeof onFail === 'function')
					onFail()
			})
		},
		downloadFiles: ({ ids }) => {
			const formData = { ids }
			post('/cloud/getDownloadInformation', formData).then((res) => {
				// Get information such as if the files will be zipped, filename, filesize
				const { zip, name, size } = res.payload
				const id = randomToken(7)

				let transfer = {
					status: zip ? 'Zipping...' : 'Starting...',
					onCancel: () => null,
					type: 'download',
					total: size,
					name: name,
					progress: 0,
					loaded: 0,
					id: id
				}

				if (size === 0) {
					transfer = {
						status: 'Completed',
						onCancel: () => dispatch.cloud.removeTransfer(transfer),
						name: transfer.name,
						progress: 100,
						id: transfer.id
					}
				}

				dispatch.cloud.setTransfer(transfer)
				dispatch.cloud.startDownload({ ids, transfer })
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		},
		startDownload: ({ ids, transfer: _transfer }) => {
			const finishTransfer = () => {
				dispatch.cloud.setTransfer({
					status: 'Completed',
					onCancel: () => dispatch.cloud.removeTransfer(_transfer),
					name: _transfer.name,
					progress: 100,
					id: _transfer.id
				})
			}

			let timeout = null
			download(`/cloud/download?ids=${JSON.stringify(ids)}`, (e, cancelRequest) => {
				clearTimeout(timeout)
				timeout = setTimeout(() => finishTransfer(), 2500)
				let progress = parseInt(Math.round((e.loaded / e.total) * 100))
				if (e.loaded >= (e.total > 0 ? e.total : _transfer.total)) progress = 100
				if (progress !== 100) {
					dispatch.cloud.setTransfer({
						onCancel: () => {
							cancelRequest()
							dispatch.cloud.setTransfer({
								status: 'Cancelled',
								onCancel: () => dispatch.cloud.removeTransfer(_transfer),
								name: _transfer.name,
								progress: 0,
								id: _transfer.id
							})
						},
						speed: _transfer.speed,
						type: _transfer.type,
						name: _transfer.name,
						progress: progress,
						loaded: e.loaded,
						total: e.total > 0 ? e.total : _transfer.total,
						id: _transfer.id
					})
				} else if (progress === 100) {
					finishTransfer()
				}
			}).then((res) => {
				saveAs(new Blob([res.data]), _transfer.name)
			}).catch((err) => {
				if (err.message === 'Download Cancelled by User') return
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		},
		uploadFile: ({ file, parent_id }) => {
			const formData = new FormData()
			formData.append('file', file)
			formData.append('parent_id', parent_id)

			const id = randomToken(7)
			const transfer = {
				status: 'Starting...',
				onCancel: () => null,
				type: 'upload',
				total: file.size,
				name: file.name,
				progress: 0,
				loaded: 0,
				id: id
			}

			const onUploadProgress = (e, cancelRequest) => {
				const progress = parseInt(Math.round((e.loaded / e.total) * 100))
				if (progress !== 100) {
					dispatch.cloud.setTransfer({
						onCancel: () => {
							cancelRequest()
							dispatch.cloud.setTransfer({
								status: 'Cancelled',
								onCancel: () => dispatch.cloud.removeTransfer(transfer),
								name: transfer.name,
								progress: 0,
								id: transfer.id
							})
						},
						speed: transfer.speed,
						type: transfer.type,
						name: transfer.name,
						progress: progress,
						loaded: e.loaded,
						total: e.total,
						id: transfer.id
					})
				} else if (progress === 100) {
					dispatch.cloud.setTransfer({
						status: 'Completed',
						onCancel: () => dispatch.cloud.removeTransfer(transfer),
						name: transfer.name,
						progress: 100,
						id: transfer.id
					})
				}
			}

			const options = {
				onUploadProgress,
				headers: {
					'content-type': 'multipart/form-data'
				}
			}

			post('/cloud/file/upload', formData, options).then((res) => {
				dispatch.cloud.add(res.payload)
			}).catch((err) => {
				if (err.message === 'Upload Cancelled by User') return
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		},
		getImageData: ({ id }) => {
			const formData = { id }
			return new Promise((resolve) => {
				post('/cloud/getImageData', formData).then((res) => {
					resolve(res)
				}).catch((err) => {
					dispatch.notifications.add({
						text: err.message,
						severity: 'error'
					})
				})
			})
		},
		setTrash: ({ ids, trash, _redo, _id }) => {
			const formData = { ids, trash }
			post('/cloud/setTrash', formData).then((res) => {
				dispatch.cloud._setTrash(res.payload)
				const notificationID = randomToken(7)
				dispatch.notifications.add({
					id: _id || notificationID,
					text: res.message,
					button: _redo ? 'Redo' : 'Undo',
					onClick: () => {
						dispatch.cloud.setTrash({
							ids,
							trash: !trash,
							_redo: !_redo,
							_id: _id || notificationID
						})
					}
				})
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		},
		setParentId: ({ ids, parent_id, currentParentId, _redo, _id }) => {
			const formData = { ids, parent_id }
			post('/cloud/setParentId', formData).then((res) => {
				dispatch.cloud._setParentId(res.payload)
				dispatch.selection.setCloudSelection([])
				const notificationID = randomToken(7)
				dispatch.notifications.add({
					id: _id || notificationID,
					text: res.message,
					button: _redo ? 'Redo' : 'Undo',
					onClick: () => {
						dispatch.cloud.setParentId({
							ids,
							parent_id: currentParentId,
							currentParentId: parent_id,
							_redo: !_redo,
							_id: _id || notificationID
						})
					}
				})
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		},
		delete: ({ ids, onSuccess, onFail, _redo, _id, _ids, _parent_id }) => {
			const formData = { ids }
			post('/cloud/delete', formData).then((res) => {
				dispatch.cloud._delete(res.payload)

				/* Redo/Undo for copying Files */
				if (_redo && _id) {
					dispatch.notifications.add({
						id: _id,
						text: res.message,
						button: _redo ? 'Redo' : 'Undo',
						onClick: () => {
							dispatch.cloud.copyFiles({
								ids: _ids,
								parent_id: _parent_id,
								_redo: !_redo,
								_id: _id
							})
						}
					})
				} else {
					dispatch.notifications.add(res.message)
				}

				if (typeof onSuccess === 'function')
					onSuccess()
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
				if (typeof onFail === 'function')
					onFail()
			})
		},
		setShared: ({ id, password, onSuccess, onFail }) => {
			const formData = { fileId: id, password }
			post('/cloud/setShared', formData).then((res) => {
				dispatch.cloud._setShared(res.payload)
				onSuccess(res.payload.sharedKey)
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
				onFail()
			})
		},
		deleteShared: ({ id, onSuccess, onFail }) => {
			const formData = { fileId: id }
			post('/cloud/deleteShared', formData).then((res) => {
				dispatch.cloud._setShared(res.payload)
				onSuccess()
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
				onFail()
			})
		},
		copyFiles: ({ ids, parent_id, _redo, _id }) => {
			const formData = { ids, parent_id }
			post('/cloud/copyFiles', formData).then((res) => {
				res.payload.files.forEach((file) => {
					dispatch.cloud.add(file)
				})
				const notificationID = randomToken(7)
				dispatch.notifications.add({
					id: _id || notificationID,
					text: res.message,
					button: _redo ? 'Redo' : 'Undo',
					onClick: () => {
						dispatch.cloud.delete({
							ids: res.payload.files.map((e) => e.id),
							_ids: ids,
							_parent_id: parent_id,
							_redo: !_redo,
							_id: _id || notificationID
						})
					}
				})
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		}
	})
}