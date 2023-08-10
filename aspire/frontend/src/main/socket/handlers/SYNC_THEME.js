import storage from 'library/utilities/storage'
import store from 'main/store'

export default function SYNC_THEME(payload) {
	const settings = storage.getSettings()
	settings.themes = payload.themes
	storage.setItem('settings', settings)
	const state = store.getState()
	store.dispatch.theme.set(state.theme === 'dark' ? 'light' : 'dark')
	store.dispatch.theme.set(state.theme)
}