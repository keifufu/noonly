import randomToken from 'library/utilities/randomToken'
import post from 'main/axios/post'
import rfdc from 'rfdc'
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
		_delete: (state, payload) => {
			const clonedState = clone(state)
			payload.ids.forEach((id) => {
				delete clonedState[id]
			})
			return clonedState
		},
		_editFavorite: (state, payload) => {
			const clonedState = clone(state)
			payload.ids.forEach((id) => {
				clonedState[id].favorite = payload.favorite
			})
			return clonedState
		},
		_editTrash: (state, payload) => {
			const clonedState = clone(state)
			payload.ids.forEach((id) => {
				clonedState[id].trash = payload.trash
			})
			return clonedState
		}
	},
	effects: (dispatch) => ({
		editFavorite({ ids, favorite }, rootState) {
			const formData = {
				ids: ids.filter((id) => Boolean(rootState.screenshots[id].favorite) !== favorite),
				favorite
			}
			if (formData.ids.length === 0) return

			post('/screenshots/editFavorite', formData).then((res) => {
				dispatch.screenshots._editFavorite(res.updated)
				dispatch.notifications.add(res.message)
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		},
		editTrash({ ids, trash, _redo, _id }, rootState) {
			const formData = {
				ids: ids.filter((id) => Boolean(rootState.screenshots[id].trash) !== trash),
				trash
			}
			if (formData.ids.length === 0) return

			post('/screenshots/editTrash', formData).then((res) => {
				dispatch.screenshots._editTrash(res.updated)
				const notificationID = randomToken(7)
				dispatch.notifications.add({
					id: _id || notificationID,
					text: res.message,
					button: _redo ? 'Redo' : 'Undo',
					onClick: () => {
						dispatch.screenshots.editTrash({
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
			post('/screenshots/delete', formData).then((res) => {
				dispatch.screenshots._delete(res.deleted)
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