/* eslint-disable arrow-body-style */
const storage = {
	getItem: (name, returnIfEmpty = {}) => {
		return localStorage.getItem(name)
			? JSON.parse(localStorage.getItem(name))
			: returnIfEmpty
	},
	setItem: (name, data) => {
		if (typeof data === 'string')
			localStorage.setItem(name, data)
		else
			localStorage.setItem(name, JSON.stringify(data))
	},
	removeItem: (name) => {
		localStorage.removeItem(name)
	},
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

export default storage