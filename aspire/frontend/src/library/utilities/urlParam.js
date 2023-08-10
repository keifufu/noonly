function urlParam(name) {
	const results = new RegExp(`[?&]${name}=([^&#]*)`).exec(window.location.href)
	return (results && results[1]) || null
}

export default urlParam