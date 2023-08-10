export const randomToken = (length = 24) => {
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let output = ''
	for (let i = 0; i < length; i++) {
		output += charset.charAt(Math.floor(Math.random() * charset.length))
	}
	return output
}

export const giveString = () => {
	return 'Learn React'
}