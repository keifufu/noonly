function slice(text) {
	if (text.length <= 25) return text
	return `${text.slice(0, 25)}...`
}

export default slice