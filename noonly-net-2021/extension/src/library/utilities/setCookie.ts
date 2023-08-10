const setCookie = (name: string, value: string, minutes?: number): void => {
	let expires = ''
	if (minutes) {
		const date = new Date()
		date.setTime(date.getTime() + (minutes * 60 * 1000))
		expires = `; expires=${date.toUTCString()}`
	} else {
		expires = ''
	}
	document.cookie = `${name}=${value}${expires}; path=/`
}

export default setCookie