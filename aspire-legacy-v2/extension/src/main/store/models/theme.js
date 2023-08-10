import getCookie from 'library/utilities/getCookie'
import setCookie from 'library/utilities/setCookie'
import storage from 'library/utilities/storage'
import post from 'main/axios/post'

const themeCookie = getCookie('theme')
const initialState = ['dark', 'light'].includes(themeCookie) ? themeCookie : 'dark'

export default {
	state: initialState,
	reducers: {
		toggle: (state, payload) => {
			const newState = state === 'dark' ? 'light' : 'dark'
			setCookie('theme', newState, '99999')
			return newState
		},
		set: (state, payload) => {
			if (!['dark', 'light'].includes(payload)) return state
			setCookie('theme', payload, '99999')
			return payload
		}
	},
	effects: (dispatch) => ({
		sync: () => {
			const { themes } = storage.getSettings()
			const formData = { themes }
			post('/sync/themes', formData).catch((err) => {
				dispatch.notifications.add({
					text: 'Failed to sync themes',
					severity: 'error'
				})
			})
		}
	})
}