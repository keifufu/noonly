const randomToken = (length = 24): string => {
	let token = ''
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	for (let i = 0; i < length; i++)
		token += charset.charAt(Math.floor(Math.random() * charset.length))
	return token
}

export default randomToken