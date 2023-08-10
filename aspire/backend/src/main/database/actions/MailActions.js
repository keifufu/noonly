import store from '#main/store'

class MailActions {
	constructor(query) {
		this.query = query
	}

	get(id, user_id) {
		return this.query('SELECT * FROM mail WHERE id = ? AND user_id = ?', [id, user_id])
	}

	getAll() {
		return this.query('SELECT * FROM mail')
	}

	getAddressByIdAndAddress(user_id, address) {
		return this.query('SELECT * from mail_accounts WHERE user_id = ? AND address = ?', [user_id, address])
	}

	getAllByAddress(address) {
		return this.query('SELECT * FROM mail WHERE to_address = ?', [address])
	}

	getTrash(user_id) {
		return this.query('SELECT * FROM mail WHERE user_id = ? AND trash = ?', [user_id, true])
	}

	setTrash(id, user_id, trash) {
		return this.query('UPDATE mail SET trash = ? WHERE id = ? AND user_id = ?', [trash, id, user_id])
	}

	setRead(id, user_id, read) {
		return this.query('UPDATE mail SET isread = ? WHERE id = ? AND user_id = ?', [read, id, user_id])
	}

	setFavorite(id, user_id, favorite) {
		return this.query('UPDATE mail SET favorite = ? WHERE id = ? AND user_id = ?', [favorite, id, user_id])
	}

	setArchived(id, user_id, archived) {
		return this.query('UPDATE mail SET archived = ? WHERE id = ? AND user_id = ?', [archived, id, user_id])
	}

	delete(id, user_id) {
		return this.query('DELETE FROM mail WHERE id = ? AND user_id = ?', [id, user_id])
	}

	getReplies(messageId) {
		return this.query('SELECT * FROM mail WHERE in_reply_to = ?', [messageId])
	}

	getAddress(address) {
		return this.query('SELECT * FROM mail_accounts WHERE address = ?', [address])
	}

	// eslint-disable-next-line max-params
	insert(user_id, from, to, inReplyto, date, message_id, id) {
		return this.query(`
			INSERT INTO mail
			(user_id, from_address, to_address, in_reply_to, isread, favorite, trash, archived, date, message_id, id)
			VALUES
			(?, ?, ?, ?, FALSE, FALSE, FALSE, FALSE, ?, ?, ?)
		`, [user_id, from, to, inReplyto, date, message_id, id])
	}

	async createAccount(user_id, address) {
		const addresses = await store.database.users.getMailAccountsById(user_id)
		let highestIndex = -1
		addresses.forEach((row) => {
			if (row.order_index > highestIndex)
				highestIndex = row.order_index
		})
		return this.query('INSERT INTO mail_accounts (user_id, address, visible, order_index) VALUES (?, ?, TRUE, ?)', [user_id, address, highestIndex + 1])
	}

	removeAccount(user_id, address) {
		return this.query('DELETE FROM mail_accounts WHERE user_id = ? AND address = ?', [user_id, address])
	}

	setOrder(user_id, address, index) {
		return this.query('UPDATE mail_accounts SET order_index = ? WHERE user_id = ? AND address = ?', [index, user_id, address])
	}

	setVisible(user_id, address, visible) {
		return this.query('UPDATE mail_accounts SET visible = ? WHERE user_id = ? AND address = ?', [visible, user_id, address])
	}
}

export default MailActions