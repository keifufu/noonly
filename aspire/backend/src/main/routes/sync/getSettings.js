export default {
	route: '/sync/getSettings',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const [settings] = await store.database.settings.getSettingsById(user.id)
		const themes = settings.themes ? JSON.parse(settings.themes) : null
		const passwordGenerator = settings.passwordGenerator ? JSON.parse(settings.passwordGenerator) : null

		res.sendRes({
			message: '',
			payload: {
				themes,
				passwordGenerator
			}
		})
	}
}