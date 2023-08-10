import multipart from 'connect-multiparty'
import compression from 'compression'
import bodyParser from 'body-parser'
import express from 'express'
import dotenv from 'dotenv'
import https from 'https'
import cors from 'cors'
import fs from 'fs'

import User from '#main/database/mongodb/schemas/UserSchema'
import dirname from '#library/utilities/dirname'
import createSocket from '#main/socket'
import Database from '#main/database'
import store from '#main/store'

const __dirname = dirname()
dotenv.config({ path: `${__dirname}/../.env` })
const multipartMiddleware = multipart()
const app = express()
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cors({ origin: '*' }))
app.use(compression())

const key = fs.readFileSync(`C:/Aspire/httpd/conf/certs/${process.env.HOSTNAME}/private.key`)
const cert = fs.readFileSync(`C:/Aspire/httpd/conf/certs/${process.env.HOSTNAME}/certificate.crt`)
const ca = fs.readFileSync(`C:/Aspire/httpd/conf/certs/${process.env.HOSTNAME}/ca_bundle.crt`)
const credentials = { key: key, cert: cert, ca: ca }

const database = new Database({
	host: process.env.SQL_HOST,
	port: process.env.SQL_PORT,
	user: process.env.SQL_USER,
	password: process.env.SQL_PASSWORD,
	database: process.env.SQL_DATABASE
})
store.setDevBuild(__dirname.includes('dev'))
store.setDatabase(database)

const routes = []
const items = fs.readdirSync(`${__dirname}/main/routes`)
items.forEach((item) => {
	if (fs.statSync(`${__dirname}/main/routes/${item}`).isDirectory()) {
		const _items = fs.readdirSync(`${__dirname}/main/routes/${item}`)
		_items.forEach((_item) => {
			if (fs.statSync(`${__dirname}/main/routes/${item}/${_item}`).isDirectory()) {
				const __items = fs.readdirSync(`${__dirname}/main/routes/${item}/${_item}`)
				__items.forEach((__item) => routes.push(`file://${__dirname}/main/routes/${item}/${_item}/${__item}`))
			} else {
				routes.push(`file://${__dirname}/main/routes/${item}/${_item}`)
			}
		})
	} else {
		routes.push(`file://${__dirname}/main/routes/${item}`)
	}
})

routes.forEach(async (path) => {
	const module = await import(path)
	const route = module.default

	const execute = async (req, res) => {
		res.reject = (msg) => {
			let message = 'Something went wrong'
			if (typeof msg === 'string')
				message = msg
			res.send({
				res: false,
				message: message,
				payload: null
			})
		}
		res.sendRes = (obj) => {
			const response = {
				res: true,
				message: '',
				payload: {}
			}
			if (typeof obj === 'object' && obj.message)
				response.message = obj.message
			if (typeof obj === 'object' && obj.payload)
				response.payload = obj.payload
			res.send(response)
		}
		try {
			if (route.user) {
				const [user] = await store.database.users.getByToken(req.headers.token)
				if (!user) return res.reject('Unauthorized Request')
				route.execute(req, res, store, user)
			} else {
				route.execute(req, res, store)
			}
		} catch (e) {
			console.error(e)
		}
	}

	if (route.middleware)
		app[route.type](route.route, multipartMiddleware, execute)
	else
		app[route.type](route.route, execute)
})

const httpsServer = https.createServer(credentials, app)
createSocket(httpsServer)
const port = store.isDevBuild ? process.env.DEVELOPMENT_PORT : process.env.PRODUCTION_PORT
httpsServer.listen(port || 5000, () => console.log(`Now listening on port ${port || 5000}`))