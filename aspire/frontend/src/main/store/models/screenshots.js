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
		remove: (state, payload) => {
			const clonedState = clone(state)
			payload.ids.forEach((id) => {
				delete clonedState[id]
			})
			return clonedState
		},
		_setFavorite: (state, payload) => {
			const clonedState = clone(state)
			payload.ids.forEach((id) => {
				clonedState[id].favorite = payload.favorite
			})
			return clonedState
		},
		_setTrash: (state, payload) => {
			const clonedState = clone(state)
			payload.ids.forEach((id) => {
				clonedState[id].trash = payload.trash
			})
			return clonedState
		}
	},
	effects: (dispatch) => ({
		setFavorite({ ids, favorite }, rootState) {
			const formData = {
				ids: ids.filter((id) => Boolean(rootState.screenshots[id].favorite) !== favorite),
				favorite
			}
			if (formData.ids.length === 0) return

			post('/screenshots/setFavorite', formData).then((res) => {
				dispatch.screenshots._setFavorite(res.payload)
				dispatch.notifications.add(res.message)
			}).catch((err) => {
				dispatch.notifications.add({
					text: err.message,
					severity: 'error'
				})
			})
		},
		setTrash({ ids, trash, _redo, _id }, rootState) {
			const formData = {
				ids: ids.filter((id) => Boolean(rootState.screenshots[id].trash) !== trash),
				trash
			}
			if (formData.ids.length === 0) return

			post('/screenshots/setTrash', formData).then((res) => {
				dispatch.screenshots._setTrash(res.payload)
				const notificationID = randomToken(7)
				dispatch.notifications.add({
					id: _id || notificationID,
					text: res.message,
					button: _redo ? 'Redo' : 'Undo',
					onClick: () => {
						dispatch.screenshots.setTrash({
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
				dispatch.screenshots.remove(res.payload)
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