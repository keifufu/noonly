import randomToken from 'library/utilities/randomToken'
import setCookie from 'library/utilities/setCookie'
import storage from 'library/utilities/storage'
import post from 'main/axios/post'
import socket from 'main/socket'
import rfdc from 'rfdc'
const clone = rfdc()

/**
 * Selected Email addresses will ALWAYS be lowercase!!
 */

function attachPayloadToId(items, id, payload) {
	if (Array.isArray(items)) {
		items.forEach((item, index) => {
			if (item.id === id) {
				items[index] = {
					...item,
					...payload
				}
			} else if (item.replies) {
				attachPayloadToId(item.replies, id, payload)
			}
		})
	} else if (typeof items === 'object') {
		if (items[id]) {
			items[id] = {
				...items[id],
				...payload
			}
		} else {
			Object.values(items).forEach((item) => {
				if (!item.replies) return
				attachPayloadToId(item.replies, id, payload)
			})
		}
	}
}

export default {
	state: {
		selected: `${storage.user?.username.toLowerCase()}@${process.env.REACT_APP_HOSTNAME}`,
		order: {},
		visible: {},
		origName: {},
		images: {},
		incoming: {}
	},
	reducers: {
		set: (state, payload) => ({
			...payload,
			order: payload.order || state.order,
			visible: payload.visible || state.visible,
			origName: payload.origName || state.origName,
			selected: state.selected,
			images: state.images,
			incoming: state.incoming
		}),
		_addAddress: (state, payload) => {
			setCookie('selected-address', payload.address, '9999')
			const clonedState = clone(state)
			clonedState[payload.address] = []
			clonedState.unread[payload.address] = 0
			clonedState.origName[payload.address] = payload.origName
			clonedState.selected = payload.address
			return clonedState
		},
		_removeAddress: (state, payload) => {
			const clonedState = clone(state)
			delete clonedState[payload]
			delete clonedState.unread[payload]
			delete clonedState.origName[payload]
			clonedState.selected = `${storage.user?.username.toLowerCase()}@${process.env.REACT_APP_HOSTNAME}`
			return clonedState
		},
		_setOrder: (state, payload) => {
			const clonedState = clone(state)
			clonedState.order = payload
			return clonedState
		},
		_setVisible: (state, payload) => {
			const clonedState = clone(state)
			clonedState.visible = payload
			return clonedState
		},
		setIncoming: (state, payload) => {
			const clonedState = clone(state.incoming)
			clonedState[payload.address] = payload.incoming
			return {
				...state,
				incoming: clonedState
			}
		},
		addUnread: (state, payload) => {
			const clonedState = clone(state.unread)
			clonedState[payload.address] += payload.unread
			return {
				...state,
				unread: clonedState
			}
		},
		removeUnread: (state, payload) => {
			const clonedState = clone(state.unread)
			clonedState[payload.address] -= payload.unread
			return {
				...state,
				unread: clonedState
			}
		},
		setSelected: (state, payload) => {
			setCookie('selected-address', payload, '9999')
			return {
				...state,
				selected: payload
			}
		},
		remove: (state, payload) => {
			const clonedState = clone(state)
			payload.ids.forEach((id) => {
				delete clonedState[clonedState.selected][id]
			})
			return clonedState
		},
		addImages: (state, payload) => {
			const clonedState = clone(state.images)
			clonedState[payload.id] = payload.images
			return {
				...state,
				images: clonedState
			}
		},
		_setFavorite: (state, payload) => {
			const clonedState = clone(state[state.selected])
			payload.ids.forEach((id) => {
				clonedState[id].favorite = payload.favorite
			})
			const newState = {}
			newState[state.selected] = clonedState
			return {
				...state,
				...newState
			}
		},
		_setArchived: (state, payload) => {
			const clonedState = clone(state[state.selected])
			payload.ids.forEach((id) => {
				clonedState[id].archived = payload.archived
			})
			const newState = {}
			newState[state.selected] = clonedState
			return {
				...state,
				...newState
			}
		},
		_setTrash: (state, payload) => {
			const clonedState = clone(state[state.selected])
			payload.ids.forEach((id) => {
				clonedState[id].trash = payload.trash
			})
			const newState = {}
			newState[state.selected] = clonedState
			return {
				...state,
				...newState
			}
		},
		_setRead: (state, payload) => {
			const clonedState = clone(state[state.selected])
			payload.ids.forEach((id) => {
				clonedState[id].isread = payload.read
			})
			const newState = {}
			newState[state.selected] = clonedState
			return {
				...state,
				...newState
			}
		},
		_setContent: (state, payload) => {
			const clonedState = clone(state[state.selected])
			attachPayloadToId(clonedState, payload.id, payload)
			const newState = {}
			newState[state.selected] = clonedState
			return {
				...state,
				...newState
			}
		}
	},
	effects: (dispatch) => ({
		refresh(payload, rootState) {
			socket.emit('FETCH_MAIL')
		},
		fetchImageAttachments({ id }) {
			const formData = { id }
			post('/mail/fetchImageAttachments', formData).then((res) => {
				dispatch.mail.addImages({ id, images: res.payload })
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		},
		setRead({ ids, read, notification = true }, rootState) {
			const formData = {
				ids: ids.filter((id) => Boolean(rootState.mail[rootState.mail.selected][id].isread) !== read),
				read
			}
			if (formData.ids.length === 0) return

			post('/mail/setRead', formData).then((res) => {
				dispatch.mail._setRead(res.payload)
				if (notification)
					dispatch.notifications.add(res.message)
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		},
		setFavorite({ ids, favorite }, rootState) {
			const formData = {
				ids: ids.filter((id) => Boolean(rootState.mail[rootState.mail.selected][id].favorite) !== favorite),
				favorite
			}
			if (formData.ids.length === 0) return

			post('/mail/setFavorite', formData).then((res) => {
				dispatch.mail._setFavorite(res.payload)
				dispatch.notifications.add(res.message)
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		},
		setArchived({ ids, archived, _redo, _id }, rootState) {
			const formData = {
				ids: ids.filter((id) => Boolean(rootState.mail[rootState.mail.selected][id].archived) !== archived),
				archived
			}
			if (formData.ids.length === 0) return

			post('/mail/setArchived', formData).then((res) => {
				dispatch.mail._setArchived(res.payload)
				const notificationID = randomToken(7)
				dispatch.notifications.add({
					id: _id || notificationID,
					text: res.message,
					button: _redo ? 'Redo' : 'Undo',
					onClick: () => {
						dispatch.mail.setArchived({
							ids,
							archived: !archived,
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
		setTrash({ ids, trash, _redo, _id }, rootState) {
			const formData = {
				ids: ids.filter((id) => Boolean(rootState.mail[rootState.mail.selected][id].trash) !== trash),
				trash
			}
			if (formData.ids.length === 0) return

			post('/mail/setTrash', formData).then((res) => {
				dispatch.mail._setTrash(res.payload)
				const notificationID = randomToken(7)
				dispatch.notifications.add({
					id: _id || notificationID,
					text: res.message,
					button: _redo ? 'Redo' : 'Undo',
					onClick: () => {
						dispatch.mail.setTrash({
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
		delete({ ids, onSuccess, onFail }) {
			const formData = { ids }
			post('/mail/delete', formData).then((res) => {
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
		clearTrash({ onSuccess, onFail }, rootState) {
			if (Object.values(rootState.mail[rootState.mail.selected]).filter((e) => e.trash).length === 0)
				return onSuccess()

			post('/mail/clearTrash').then((res) => {
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
		addAddress({ address, onSuccess, onFail }) {
			const formData = { address }
			post('/mail/addAddress', formData).then((res) => {
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
		deleteAddress({ address, onSuccess, onFail }) {
			const formData = { address }
			post('/mail/deleteAddress', formData).then((res) => {
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
		setOrderAndVisibility({ order, visible, onSuccess, onFail }) {
			const formData = { order, visible }
			post('/mail/setOrderAndVisibility', formData).then((res) => {
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
		send({ subject, recipients, html, text, onSuccess, onFail }, rootState) {
			const formData = { address: rootState.mail.selected, subject, recipients, html, text }
			post('/mail/send', formData).then((res) => {
				dispatch.notifications.add(res.message)
				onSuccess()
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
				onFail()
			})
		}
	})
}