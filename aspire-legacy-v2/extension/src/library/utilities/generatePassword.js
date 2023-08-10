import storage from 'library/utilities/storage'

function generatePassword() {
	const settings = storage.getSettings()
	let charset = ''
	if (settings.passwordGenerator.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	if (settings.passwordGenerator.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
	if (settings.passwordGenerator.numbers) charset += '0123456789'
	if (settings.passwordGenerator.symbols) charset += '!!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
	let password = ''
	for (let i = 0; i < settings.passwordGenerator.length; i++)
		password += charset[Math.floor(Math.random() * charset.length)]
	return password
}

export default generatePassword