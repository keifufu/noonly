class CloudActions {
	constructor(query) {
		this.query = query
	}

	get(id, user_id) {
		return this.query('SELECT * FROM cloud WHERE id = ? AND user_id = ?', [id, user_id])
	}

	getUnauthorized(id) {
		return this.query('SELECT * FROM cloud WHERE id = ?', [id])
	}

	getAll(user_id) {
		return this.query('SELECT * FROM cloud WHERE user_id = ?', [user_id])
	}

	getTrash(user_id) {
		return this.query('SELECT * FROM cloud WHERE user_id = ? AND trash = ?', [user_id, true])
	}

	getSharedByKey(key) {
		return this.query('SELECT * FROM cloud_shared WHERE id = ?', [key])
	}

	getSharedByFileId(id, user_id) {
		return this.query('SELECT * FROM cloud_shared WHERE file_id = ? AND user_id = ?', [id, user_id])
	}

	getAllShared(user_id) {
		return this.query('SELECT * FROM cloud_shared WHERE user_id = ?', [user_id])
	}

	getByParentId(parent_id, user_id) {
		return this.query('SELECT * FROM cloud WHERE parent_id = ? AND user_id = ?', [parent_id, user_id])
	}

	setParentId(id, user_id, parent_id) {
		return this.query('UPDATE cloud SET parent_id = ? WHERE id = ? AND user_id = ?', [parent_id, id, user_id])
	}

	rename(id, user_id, name) {
		return this.query('UPDATE cloud SET name = ? WHERE id = ? AND user_id = ?', [name, id, user_id])
	}

	setTrash(id, user_id, trash) {
		return this.query('UPDATE cloud SET trash = ? WHERE id = ? AND user_id = ?', [trash, id, user_id])
	}

	delete(id, user_id) {
		return this.query('DELETE FROM cloud WHERE id = ? AND user_id = ?', [id, user_id])
	}

	deleteShared(id, user_id) {
		return this.query('DELETE FROM cloud_shared WHERE file_id = ? AND user_id = ?', [id, user_id])
	}

	insertShared(user_id, id, key, password) {
		return this.query(`
			INSERT INTO cloud_shared
			(user_id, file_id, password, id)
			VALUES
			(?, ?, ?, ?)
		`, [user_id, id, password, key])
	}

	updateShared(fileId, password) {
		return this.query(`
			UPDATE cloud_shared
			SET password = ?
			WHERE file_id = ?
		`, [password, fileId])
	}

	insertFile(user_id, name, size, parent_id, id) {
		const date = Date.now()
		return this.query(`
			INSERT INTO cloud
			(user_id, name, type, size, createdAt, modifiedAt, parent_id, trash, id)
			VALUES
			(?, ?, 'file', ?, ?, ?, ?, FALSE, ?)
		`, [user_id, name, size, date, date, parent_id, id])
	}

	insertFolder(user_id, name, size, parent_id, id) {
		const date = Math.floor(Date.now())
		return this.query(`
			INSERT INTO cloud
			(user_id, name, type, size, createdAt, modifiedAt, parent_id, trash, id)
			VALUES
			(?, ?, 'folder', ?, ?, ?, ?, FALSE, ?)
		`, [user_id, name, size, date, date, parent_id, id])
	}
}

export default CloudActions