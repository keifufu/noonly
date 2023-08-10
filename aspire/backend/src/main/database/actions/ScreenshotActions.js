/* eslint-disable max-params */
class ScreenshotActions {
	constructor(query) {
		this.query = query
	}

	get(id, user_id) {
		return this.query('SELECT * FROM screenshots WHERE id = ? AND user_id = ?', [id, user_id])
	}

	getAll(user_id) {
		return this.query('SELECT * FROM screenshots WHERE user_id = ?', [user_id])
	}

	delete(id, user_id) {
		return this.query('DELETE FROM screenshots WHERE id = ? AND user_id = ?', [id, user_id])
	}

	setFavorite(id, user_id, favorite) {
		return this.query('UPDATE screenshots SET favorite = ? WHERE id = ? AND user_id = ?', [favorite, id, user_id])
	}

	setTrash(id, user_id, trash) {
		return this.query('UPDATE screenshots SET trash = ? WHERE id = ? AND user_id = ?', [trash, id, user_id])
	}

	insert(user_id, name, ext, dimensions, size, id) {
		return this.query(`
			INSERT INTO screenshots
			(user_id, name, type, width, height, size, createdAt, favorite, trash, id)
			VALUES
			(?, ?, ?, ?, ?, ?, ?, FALSE, FALSE, ?)
		`, [user_id, name, ext, dimensions.width, dimensions.height, size, Date.now(), id])
	}
}

export default ScreenshotActions