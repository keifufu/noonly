import { init } from '@rematch/core'

import notifications from './models/notifications'
import storage from 'library/utilities/storage'
import contextMenu from './models/contextMenu'
import searchInput from './models/searchInput'
import passwords from './models/passwords'
import dialog from './models/dialog'
import theme from './models/theme'
import post from 'main/axios/post'
import sort from './models/sort'

const store = init({
	models: {
		contextMenu,
		dialog,
		notifications,
		passwords,
		searchInput,
		sort,
		theme
	}
})

store.fetchPasswords = () => {
	post('/passwords/fetch').then((res) => {
		store.dispatch.passwords.set(res.payload)
		storage.setItem('passwords', res.payload)
	}).catch(() => null)
}
store.fetchPasswords()

store.syncSettings = () => {
	post('/sync/getSettings').then((res) => {
		const settings = storage.getSettings()
		if (res.payload.themes) settings.themes = res.payload.themes
		if (res.payload.passwordGenerator) settings.passwordGenerator = res.payload.passwordGenerator
		storage.setItem('settings', settings)

		const state = store.getState()
		store.dispatch.theme.set(state.theme === 'dark' ? 'light' : 'dark')
		store.dispatch.theme.set(state.theme)
	}).catch(() => null)
}
store.syncSettings()

export default store