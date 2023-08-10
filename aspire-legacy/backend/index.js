require('dotenv').config({ path: __dirname + '/.env' })
const multipart = require('connect-multiparty')
const handler = require('./socket/handler')
const { rimraf } = require('./Utilities')
const bodyParser = require('body-parser')
const multipartMiddleware = multipart()
const mysql = require('promise-mysql')
const express = require('express')
const nodePath = require('path')
const https = require('https')
const cors = require('cors')
const fs = require('fs')
const app = express()
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cors())

const key = fs.readFileSync('C:/Aspire/httpd/conf/certs/private.key')
const cert = fs.readFileSync('C:/Aspire/httpd/conf/certs/certificate.crt')
const ca = fs.readFileSync('C:/Aspire/httpd/conf/certs/ca_bundle.crt')
const credentials = { key: key, cert: cert, ca: ca }

mysql.createConnection({
	host: process.env.SQL_HOST,
	port: process.env.SQL_PORT,
	user: process.env.SQL_USER,
	password: process.env.SQL_PASSWORD,
	database: process.env.SQL_DATABASE
}).then(con => {
	if(!con) return
	setInterval(() => con.query('SELECT 1'), 5000)
	con.query(`CREATE TABLE IF NOT EXISTS users (username VARCHAR(24), password VARCHAR(1024), avatar VARCHAR(28), token VARCHAR(24), ss_token VARCHAR(7), id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)`)
	con.query(`CREATE TABLE IF NOT EXISTS passwords (account_username VARCHAR(24), site VARCHAR(128), username VARCHAR(128), email VARCHAR(128), password VARCHAR(1024), trash VARCHAR(5), createdAt VARCHAR(11), modifiedAt VARCHAR(11), icon VARCHAR(12), note VARCHAR(2048), id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)`)
	con.query(`CREATE TABLE IF NOT EXISTS screenshots (account_username VARCHAR(24), name VARCHAR(12), type VARCHAR(4), width VARCHAR(5), height VARCHAR(5), size VARCHAR(11), created VARCHAR(11), favorite VARCHAR(5), trash VARCHAR(5), id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)`)
	con.query(`CREATE TABLE IF NOT EXISTS shared (token VARCHAR(24), expires VARCHAR(11), path VARCHAR(512), size VARCHAR(512), id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)`)
	con.query(`CREATE TABLE IF NOT EXISTS restore (account_username VARCHAR(24), path VARCHAR(512), originalPath VARCHAR(512), id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)`)
	con.query(`CREATE TABLE IF NOT EXISTS mail_accounts (account_username VARCHAR(24), address VARCHAR(512), id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)`)
	con.query(`CREATE TABLE IF NOT EXISTS mail (aspire_id VARCHAR(24), from_address VARCHAR(512), to_address VARCHAR(512), forwarded_to VARCHAR(512), isread VARCHAR(5), favorite VARCHAR(5), location VARCHAR(24), path VARCHAR(512), originalPath VARCHAR(512), id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)`)
	con.query(`CREATE TABLE IF NOT EXISTS messages (type INT, channel_id VARCHAR(24), attachments VARCHAR(512), author VARCHAR(24), content VARCHAR(2048), createdAt VARCHAR(11), editedAt VARCHAR(11), pinned VARCHAR(5), id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)`)
	con.query(`CREATE TABLE IF NOT EXISTS friends (user_id INT, friend_id INT, channel_id VARCHAR(24), id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)`)
	con.query(`CREATE TABLE IF NOT EXISTS friend_requests (user_id INT, friend_id INT, id INT NOT NULL AUTO_INCREMENT PRIMARY KEY)`)
	con.query(`CREATE TABLE IF NOT EXISTS groups (channel_id VARCHAR(24), users VARCHAR(512))`)

	setInterval(() => checkExpired(con), 5 * 60 * 1000)
	setInterval(() => clearUserDL(), 12 * 60 * 60 * 1000)
	const routes = []
	const items = fs.readdirSync(__dirname + '/routes')
	items.forEach(item => {
		if(fs.statSync(__dirname + `/routes/${item}`).isDirectory()) {
			const _items = fs.readdirSync(__dirname + `/routes/${item}`)
			_items.forEach(_item => {
				if(fs.statSync(__dirname + `/routes/${item}/${_item}`).isDirectory()) {
					const __items = fs.readdirSync(__dirname + `/routes/${item}/${_item}`)
					__items.forEach(__item => routes.push(require(__dirname + `/routes/${item}/${_item}/${__item}`)))
				} else routes.push(require(__dirname + `/routes/${item}/${_item}`))
			})
		} else routes.push(require(__dirname + `/routes/${item}`))
	})
	routes.forEach(route => {
		if(route.middleware) {
			app[route.type](route.route, multipartMiddleware, (req, res) => route.execute(req, res, con, handler))
		} else {
			app[route.type](route.route, (req, res) => route.execute(req, res, con, handler))
		}
	})


	const httpsServer = https.createServer(credentials, app)
	handler.create(httpsServer, con)
	httpsServer.listen(process.env.PORT || 5000, () => console.log(`Now listening on port ${process.env.PORT || 5000}`))
}).catch(console.log)

async function checkExpired(con) {
	const rows = await con.query(`SELECT * FROM shared`)
	const tokens = []
	rows.forEach(row => {
		if(Math.floor(Date.now() / 1000) < row.expires) return tokens.push(row.token)
		con.query(`DELETE FROM shared WHERE id = '${row.id}'`)
	})
	const path = nodePath.normalize(`${process.env.NODE_DIR}/data/temp`)
	const files = fs.readdirSync(path)
	files.forEach(file => {
		if(file === 'userdl') return
		if(tokens.includes(file.split('.')[0])) return
		const _path = `${path}/${file}`
		if(fs.statSync(_path).isDirectory()) rimraf(_path)
		else fs.unlinkSync(_path)
	})
}

function clearUserDL() {
	const path = nodePath.normalize(`${process.env.NODE_DIR}/data/temp/userdl`)
	const files = fs.readdirSync(path)
	files.forEach(file => {
		const _path = nodePath.normalize(`${path}/${file}`)
		if(fs.statSync(_path).isDirectory()) rimraf(_path)
		else fs.unlinkSync(_path)
	})
}