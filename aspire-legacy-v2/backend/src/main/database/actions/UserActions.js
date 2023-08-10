class UserActions {
	constructor(query) {
		this.query = query
	}

	getByUsername(username) {
		return this.query('SELECT * FROM users WHERE username = ?', [username])
	}

	getById(id) {
		return this.query('SELECT * FROM users WHERE id = ?', [id])
	}

	getByToken(token) {
		return this.query('SELECT * FROM users WHERE token = ?', [token])
	}

	getBySSToken(token) {
		return this.query('SELECT * FROM users WHERE ss_token = ?', [token])
	}

	getByCloudToken(token) {
		return this.query('SELECT * FROM users WHERE cloud_token = ?', [token])
	}

	getFriendsById(id) {
		return this.query('SELECT * FROM friends WHERE user_id = ?', [id])
	}

	getMailAccountsById(id) {
		return this.query('SELECT * FROM mail_accounts WHERE user_id = ?', [id])
	}

	insert(username, password, token, ssToken, cloudToken) {
		return this.query(`
			INSERT INTO users
			(username, password, token, ss_token, cloud_token)
			VALUES
			(?, ?, ?, ?, ?)
		`, [username, password, token, ssToken, cloudToken])
	}
}

export default UserActions