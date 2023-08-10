import jwtDecode from 'jwt-decode'

class Storage {
	get jwt_token() {
		return this.getItem('jwt_token', true, null)
	}

	get user() {
		if (!this.jwt_token) return null
		return jwtDecode(this.jwt_token)
	}

	getItem(name, noJson, returnIfEmpty = {}) {
		return localStorage.getItem(name)
			? noJson
				? localStorage.getItem(name)
				: JSON.parse(localStorage.getItem(name))
			: returnIfEmpty
	}

	setItem(name, data) {
		if (typeof data === 'string')
			localStorage.setItem(name, data)
		else
			localStorage.setItem(name, JSON.stringify(data))
	}

	removeItem(name) {
		localStorage.removeItem(name)
	}

	getSettings() {
		const settings = storage.getItem('settings', null)
		if (settings) return settings
		const defaultSettings = {
			passwordGenerator: {
				length: 24,
				uppercase: true,
				lowercase: true,
				numbers: true,
				symbols: true
			},
			themes: {
				dark: {
					primary: 'PRIMARY',
					secondary: 'SECONDARY',
					background: 'BACKGROUND',
					paper: 'PAPER'
				},
				light: {
					primary: 'PRIMARY',
					secondary: 'SECONDARY',
					background: 'BACKGROUND',
					paper: 'PAPER'
				}
			},
			version: 0.1
		}
		storage.setItem('settings', defaultSettings)
		return defaultSettings
	}
}

const storage = new Storage()

export default storage