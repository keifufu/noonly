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
		add: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.id] = payload
			return clonedState
		},
		remove: (state, payload) => {
			const clonedState = clone(state)
			delete clonedState[payload]
			return clonedState
		},
		_setTrash: (state, payload) => {
			const clonedState = clone(state)
			clonedState[payload.id].trash = payload.trash
			return clonedState
		},
		_setNote: (state, payload) => {
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
		create({ site, username, email, password, onSuccess, onFail }) {
			const formData = { site, username, email, password: encrypt(password) }
			post('/passwords/create', formData).then((res) => {
				dispatch.passwords.add(res.payload)
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
		update({ id, site, username, email, password, onSuccess, onFail }) {
			const formData = { id, site, username, email, password: encrypt(password) }
			post('/passwords/update', formData).then((res) => {
				dispatch.passwords.add(res.payload)
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
		setTrash({ id, trash, _redo, _id }) {
			const formData = { id, trash }
			post('/passwords/setTrash', formData).then((res) => {
				dispatch.passwords._setTrash(res.payload)
				const notificationID = randomToken(7)
				dispatch.notifications.add({
					id: _id || notificationID,
					text: res.message,
					button: _redo ? 'Redo' : 'Undo',
					onClick: () => {
						dispatch.passwords.setTrash({
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
			post('/passwords/delete', formData).then((res) => {
				dispatch.passwords.remove(res.payload)
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
		setNote({ id, note, onSuccess, onFail }) {
			const encryptedNote = encrypt(note)
			const formData = { id, note: encryptedNote }
			if (note.length === 0) formData.note = ''
			post('/passwords/setNote', formData).then((res) => {
				dispatch.passwords._setNote(res.payload)
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
			const formData = { id, icon }
			post('/passwords/setIcon', formData).then((res) => {
				dispatch.passwords._setIcon(res.payload)
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
			const formData = { id }
			post('/passwords/removeIcon', formData).then((res) => {
				dispatch.passwords._setIcon({ id, icon: null })
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
			if (Object.values(rootState.passwords).filter((e) => e.trash).length === 0)
				return onSuccess()

			post('/passwords/clearTrash').then((res) => {
				res.payload.ids.forEach((id) => {
					dispatch.passwords.remove(id)
				})
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