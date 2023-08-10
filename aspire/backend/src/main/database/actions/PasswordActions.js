/* eslint-disable max-params */
class PasswordActions {
	constructor(query) {
		this.query = query
	}

	get(id, user_id) {
		return this.query('SELECT * FROM passwords WHERE id = ? AND user_id = ?', [id, user_id])
	}

	getAll(user_id) {
		return this.query('SELECT * FROM passwords WHERE user_id = ?', [user_id])
	}

	getTrash(user_id) {
		return this.query('SELECT * FROM passwords WHERE user_id = ? AND trash = ?', [user_id, true])
	}

	delete(id, user_id) {
		return this.query('DELETE FROM passwords WHERE id = ? AND user_id = ?', [id, user_id])
	}

	setTrash(id, user_id, trash) {
		return this.query('UPDATE passwords SET trash = ? WHERE id = ? AND user_id = ?', [trash, id, user_id])
	}

	setIcon(id, user_id, icon) {
		return this.query('UPDATE passwords SET icon = ? WHERE id = ? AND user_id = ?', [icon, id, user_id])
	}

	setNote(id, user_id, note) {
		return this.query('UPDATE passwords SET note = ? WHERE id = ? AND user_id = ?', [note, id, user_id])
	}

	create(user_id, site, username, email, password, id) {
		const date = Date.now()
		return this.query(`
			INSERT INTO passwords
			(user_id, site, username, email, password, trash, createdAt, modifiedAt, icon, note, id)
			VALUES
			(?, ?, ?, ?, ?, FALSE, ?, ?, NULL, NULL, ?)
		`, [user_id, site, username, email, password, date, date, id])
	}

	update(id, user_id, site, username, email, password) {
		return this.query(`
			UPDATE passwords
			SET site = ?,
			username = ?,
			email = ?,
			password = ?,
			modifiedAt = ?
			WHERE id = ?
			AND user_id = ?
		`, [site, username, email, password, Date.now(), id, user_id])
	}
}

export default PasswordActions