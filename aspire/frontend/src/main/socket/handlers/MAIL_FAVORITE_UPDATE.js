import store from 'main/store'

export default function MAIL_FAVORITE_UPDATE(payload) {
	const state = store.getState()
	if (!state.initialLoad.mail) return
	store.dispatch.mail._setFavorite(payload)
}