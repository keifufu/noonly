class SettingsActions {
	constructor(query) {
		this.query = query
	}

	createUser(user_id) {
		return this.query('INSERT INTO settings (user_id) VALUES (?)', [user_id])
	}

	setThemes(user_id, themes) {
		return this.query('UPDATE settings SET themes = ? WHERE user_id = ?', [themes, user_id])
	}

	setPasswordGenerator(user_id, passwordGenerator) {
		return this.query('UPDATE settings SET passwordGenerator = ? WHERE user_id = ?', [passwordGenerator, user_id])
	}

	getSettingsById(user_id) {
		return this.query('SELECT * FROM settings WHERE user_id = ?', [user_id])
	}
}

export default SettingsActions