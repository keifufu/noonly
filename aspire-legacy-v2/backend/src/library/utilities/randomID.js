import randomToken from '#library/utilities/randomToken'
import store from '#main/store'

async function randomID(length, table, rowName = 'id') {
	const token = randomToken(length)
	const [row] = await store.database.query(`SELECT * FROM ${table} WHERE ${rowName} = ?`, [token])
	if (row) return randomID(length, table)
	return token
}

export default randomID