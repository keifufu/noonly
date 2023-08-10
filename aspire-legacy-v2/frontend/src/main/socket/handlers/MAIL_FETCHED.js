import store from 'main/store'

export default function MAIL_FETCHED(payload) {
	store.dispatch.mail.set(payload)
	store.dispatch.initialLoad.set({
		name: 'mail',
		value: true
	})

	const state = store.getState()

	// store.dispatch.mail.setIncoming({ address: state.mail.selected, incoming: false })

	/* Since we are re-fetching the entirity of mail, we will have to set all addresses to incoming:false */
	Object.keys(state.mail).forEach((key) => {
		if (!key.includes(`@${process.env.REACT_APP_HOSTNAME}`)) return
		store.dispatch.mail.setIncoming({ address: key, incoming: false })
	})
}