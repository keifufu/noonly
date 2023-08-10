import randomToken from 'library/utilities/randomToken'
import encrypt from 'library/utilities/encrypt'
import post from 'main/axios/post'
import rfdc from 'rfdc'
import storage from 'library/utilities/storage'
const clone = rfdc()

export default {
	state: {},
	reducers: {
		set: (state, payload) => payload,
		_create: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.id] = payload
			return clonedState
		},
		_delete: (state, payload) => {
			const clonedState = clone(state)
			if (payload.id) {
				delete clonedState[payload.id]
			} else if (payload.ids) {
				payload.ids.forEach((id) => {
					delete clonedState[id]
				})
			}
			return clonedState
		},
		_editTrash: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.id].trash = payload.trash
			return clonedState
		},
		_editNote: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.id].note = payload.note
			return clonedState
		},
		_setIcon: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.id].icon = payload.icon
			return clonedState
		}
	},
	effects: (dispatch) => ({
		create({ site, username, address, password, onSuccess, onFail }) {
			const formData = { site, username, address, password: encrypt(password) }
			post('/account/create', formData).then((res) => {
				dispatch.accounts._create(res.account)
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
		edit({ id, site, username, address, password, onSuccess, onFail }) {
			const formData = { id, site, username, address, password: encrypt(password) }
			post('/account/edit', formData).then((res) => {
				dispatch.accounts._create(res.account)
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
		editTrash({ id, trash, _redo, _id }) {
			const formData = { id, trash }
			post('/account/editTrash', formData).then((res) => {
				dispatch.accounts._editTrash(res.account)
				const notificationID = randomToken(7)
				dispatch.notifications.add({
					id: _id || notificationID,
					text: res.message,
					button: _redo ? 'Redo' : 'Undo',
					onClick: () => {
						dispatch.accounts.editTrash({
							id,
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
		delete({ id, onSuccess, onFail }) {
			const formData = { id }
			post('/account/delete', formData).then((res) => {
				dispatch.accounts._delete(res.account)
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
		editNote({ id, note, onSuccess, onFail }) {
			const encryptedNote = encrypt(note)
			const formData = { id, note: encryptedNote }
			if (note.length === 0) formData.note = ''
			post('/account/editNote', formData).then((res) => {
				dispatch.accounts._editNote(res.account)
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
		setIcon({ id, icon, onSuccess, onFail }) {
			return dispatch.notifications.add('Not implemented yet')
			const formData = { id, icon }
			post('/account/editIcon', formData).then((res) => {
				dispatch.accounts._setIcon(res.payload)
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
		removeIcon({ id, onSuccess, onFail }) {
			return dispatch.notifications.add('Not implemented yet')
			const formData = { id }
			post('/account/removeIcon', formData).then((res) => {
				dispatch.accounts._setIcon({ id, icon: null })
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
		clearTrash({ onSuccess, onFail }, rootState) {
			if (Object.values(rootState.accounts).filter((e) => e.trash).length === 0)
				return onSuccess()

			post('/account/clearTrash').then((res) => {
				dispatch.accounts._delete(res.deleted)
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
		sync: () => {
			return dispatch.notifications.add('Not implemented yet')
			const { passwordGenerator } = storage.getSettings()
			const formData = { passwordGenerator }
			post('/sync/passwordGenerator', formData).catch((err) => {
				dispatch.notifications.add({
					text: 'Failed to sync Settings',
					severity: 'error'
				})
			})
		}
	})
}