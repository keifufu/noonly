const generatePassword = (): string => {
	const settings = {
		length: 24,
		uppercase: true,
		lowercase: true,
		numbers: true,
		symbols: true
	}
	let charset = ''
	if (settings.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	if (settings.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
	if (settings.numbers) charset += '0123456789'
	if (settings.symbols) charset += '!!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
	let password = ''
	for (let i = 0; i < settings.length; i++)
		password += charset[Math.floor(Math.random() * charset.length)]
	return password
}

export default generatePassword