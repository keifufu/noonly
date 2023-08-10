import mysql from 'promise-mysql'

import DatabaseTables from '#main/database/DatabaseTables'

class DatabaseConnection extends DatabaseTables {
	constructor(credentials) {
		super()
		this.credentials = credentials
		this.connected = false
		this.con = null
		this.connect()
	}

	connect() {
		if (this.connected) return
		mysql.createConnection({
			host: this.credentials.host,
			port: this.credentials.port,
			user: this.credentials.user,
			password: this.credentials.password,
			database: this.credentials.database,
			charset: 'utf8mb4_unicode_ci'
		}).then((con) => {
			if (!con) return console.log('Connection to Database failed.')
			console.log('Connected to Database')
			setInterval(() => con.query('SELECT 1'), 5000)
			this.con = con
			this.connected = true
			this.createTables()
		}).catch(() => {
			console.log('Connection to Database failed.. Retrying in 30 seconds.')
			this.connected = false
			setTimeout(() => this.connect(), 30 * 1000)
		})
	}

	query(...args) {
		if (!this.connected) return []
		return this.con.query(...args)
	}
}

export default DatabaseConnection