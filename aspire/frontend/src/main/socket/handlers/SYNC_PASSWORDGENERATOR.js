import storage from 'library/utilities/storage'

export default function SYNC_PASSWORDGENERATOR(payload) {
	const settings = storage.getSettings()
	settings.passwordGenerator = payload.passwordGenerator
	storage.setItem('settings', settings)
}