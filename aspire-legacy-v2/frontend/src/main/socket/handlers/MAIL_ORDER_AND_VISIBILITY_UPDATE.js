import storage from 'library/utilities/storage'
import store from 'main/store'

export default function MAIL_ORDER_AND_VISIBILITY_UPDATE(payload) {
	store.dispatch.mail._setOrder(payload.order)
	store.dispatch.mail._setVisible(payload.visible)

	const state = store.getState()
	/* If currently selected address will be hidden, select default address */
	if (!payload.visible[state.mail.selected])
		store.dispatch.mail.setSelected(`${storage.user?.username.toLowerCase()}@${process.env.REACT_APP_HOSTNAME}`)
}