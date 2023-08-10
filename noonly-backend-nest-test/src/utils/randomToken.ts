const randomToken = (length: number, charset?: string): string => {
	let result = ''
	const characters = charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	for (let i = 0; i < length; i++)
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	return result
}

export default randomToken