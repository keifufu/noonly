import { RootModel } from '.'
import { createModel } from '@rematch/core'
import post from 'main/axios/post'
import rfdc from 'rfdc'
import toast from 'library/utilities/toast'

const clone = rfdc()

const state: Noonly.State.Files = {}
const files = createModel<RootModel>()({
	state,
	reducers: {
		set: (state, payload: Noonly.State.Files) => payload,
		_create(state, payload: Noonly.Action.FileCreate) {
			const clonedState = clone(state)
			clonedState[payload.id] = payload
			return clonedState
		},
		_delete(state, payload: Noonly.Action.FileDelete) {
			const clonedState = clone(state)
			payload.ids.forEach((id) => {
				delete clonedState[id]
			})
			return clonedState
		},
		_rename(state, payload: Noonly.Action.FileRename) {
			const clonedState = clone(state)
			clonedState[payload.id].name = payload.name
			return clonedState
		},
		_editTrash(state, payload: Noonly.Action.FileEditTrash) {
			const clonedState = clone(state)
			payload.ids.forEach((id) => {
				clonedState[id].trash = payload.trash
			})
			return clonedState
		},
		_editParentId(state, payload: Noonly.Action.FileEditParentId) {
			const clonedState = clone(state)
			payload.ids.forEach((id) => {
				clonedState[id].parentId = payload.parentId
			})
			return clonedState
		},
		_updateFile(state, payload: Noonly.Action.FileUpdate) {
			const clonedState = clone(state)
			if (!payload.id) return clonedState
			clonedState[payload.id] = { ...clonedState[payload.id], ...payload }
			return clonedState
		}
	},
	effects: (dispatch) => ({
		upload({ parentId, file }: Noonly.Effect.FileUpload) {
			const formData = new FormData()
			formData.append('parentId', parentId)
			formData.append('file', file)
			post('/cloud/upload', formData).then((res: Noonly.API.Response.FileUpload) => {
				dispatch.files._create(res.data.file)
			}).catch((error) => {
				toast.showError(error.message)
			})
		},
		create({ parentId, isFolder, name, overwriteExisting = false, appendName = false, onSuccess, onFail }: Noonly.Effect.FileCreate) {
			const formData: Noonly.API.Request.FileCreate = { parentId, isFolder, name, overwriteExisting, appendName }
			post('/cloud/create', formData).then((res: Noonly.API.Response.FileCreate) => {
				dispatch.files._create(res.data.file)
				if (res.data.deletedId)
					dispatch.files._delete({ ids: [res.data.deletedId] })
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		delete({ ids, onSuccess, onFail }: Noonly.Effect.FileDelete) {
			const formData: Noonly.API.Request.FileDelete = { ids }
			post('/cloud/delete', formData).then((res: Noonly.API.Response.FileDelete) => {
				dispatch.files._delete(res.data.deleted)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		clearTrash({ onSuccess, onFail }: Noonly.Effect.FileClearTrash) {
			post('/cloud/clearTrash').then((res: Noonly.API.Response.FileClearTrash) => {
				dispatch.files._delete(res.data.deleted)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		rename({ id, name, overwriteExisting = false, appendName = false, onSuccess, onFail }: Noonly.Effect.FileRename) {
			const formData: Noonly.API.Request.FileRename = { id, name, overwriteExisting, appendName }
			post('/cloud/rename', formData).then((res: Noonly.API.Response.FileRename) => {
				dispatch.files._rename(res.data.updated)
				if (res.data.deletedId)
					dispatch.files._delete({ ids: [res.data.deletedId] })
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		editTrash({ ids, trash, _redo }: Noonly.Effect.FileEditTrash) {
			const formData: Noonly.API.Request.FileEditTrash = { ids, trash }
			post('/cloud/editTrash', formData).then((res: Noonly.API.Response.FileEditTrash) => {
				dispatch.files._editTrash(res.data.updated)
				toast.show({
					id: `cloudEditTrash${ids[0]}`,
					description: res.message,
					action: _redo ? 'Redo' : 'Undo',
					onClick: () => dispatch.files.editTrash({ ids, trash: !trash, _redo: !_redo })
				})
			}).catch((error) => {
				toast.showError(error.message)
			})
		},
		editParentId({ ids, parentId, _redo }: Noonly.Effect.FileEditParentId, rootState) {
			const currentParentId = rootState.files[ids[0]].parentId
			const formData: Noonly.API.Request.FileEditParentId = { ids, parentId }
			post('/cloud/editTrash', formData).then((res: Noonly.API.Response.FileEditParentId) => {
				dispatch.files._editParentId(res.data.updated)
				toast.show({
					id: `cloudEditParentId${ids[0]}`,
					description: res.message,
					action: _redo ? 'Redo' : 'Undo',
					onClick: () => dispatch.files.editParentId({ ids, parentId: currentParentId, _redo: !_redo })
				})
			}).catch((error) => {
				toast.showError(error.message)
			})
		},
		sendInvite({ id, username, onSuccess, onFail }: Noonly.Effect.FileSendInvite) {
			const formData: Noonly.API.Request.FileSendInvite = { id, username }
			post('/cloud/sendInvite', formData).then((res: Noonly.API.Response.FileSendInvite) => {
				dispatch.files._updateFile(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		cancelInvite({ fileId, userId, onSuccess, onFail }: Noonly.Effect.FileCancelInvite) {
			const formData: Noonly.API.Request.FileCancelInvite = { fileId, userId }
			post('/cloud/cancelInvite', formData).then((res: Noonly.API.Response.FileCancelInvite) => {
				dispatch.files._updateFile(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		acceptInvite({ fileId, onSuccess, onFail }: Noonly.Effect.FileAcceptInvite) {
			const formData: Noonly.API.Request.FileAcceptInvite = { fileId }
			post('/cloud/acceptInvite', formData).then((res: Noonly.API.Response.FileAcceptInvite) => {
				dispatch.files._create(res.data.file)
				dispatch.fileInvites._delete({ id: res.data.file.id })
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		denyInvite({ fileId, onSuccess, onFail }: Noonly.Effect.FileDenyInvite) {
			const formData: Noonly.API.Request.FileDenyInvite = { fileId }
			post('/cloud/denyInvite', formData).then((res: Noonly.API.Response.FileDenyInvite) => {
				dispatch.fileInvites._delete({ id: res.data.file.id })
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		updatePermissions({ fileId, userId, permissions, onSuccess, onFail }: Noonly.Effect.FileUpdatePermissions) {
			const formData: Noonly.API.Request.FileUpdatePermissions = { fileId, userId, permissions }
			post('/cloud/updatePermissions', formData).then((res: Noonly.API.Response.FileUpdatePermissions) => {
				dispatch.files._updateFile(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		addDlKey({ id, password, onSuccess, onFail }: Noonly.Effect.FileAddDlKey) {
			const formData: Noonly.API.Request.FileAddDlKey = { id, password }
			post('/cloud/addDlKey', formData).then((res: Noonly.API.Response.FileAddDlKey) => {
				dispatch.files._updateFile(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		updateDlKey({ id, key, password, onSuccess, onFail }: Noonly.Effect.FileUpdateDlKey) {
			const formData: Noonly.API.Request.FileUpdateDlKey = { id, key, password }
			post('/cloud/updateDlKey', formData).then((res: Noonly.API.Response.FileUpdateDlKey) => {
				dispatch.files._updateFile(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		},
		removeDlKey({ id, key, onSuccess, onFail }: Noonly.Effect.FileRemoveDlKey) {
			const formData: Noonly.API.Request.FileRemoveDlKey = { id, key }
			post('/cloud/removeDlKey', formData).then((res: Noonly.API.Response.FileRemoveDlKey) => {
				dispatch.files._updateFile(res.data.updated)
				toast.show(res.message)
				onSuccess()
			}).catch((error) => {
				toast.showError(error.message)
				onFail()
			})
		}
	})
})

export default files