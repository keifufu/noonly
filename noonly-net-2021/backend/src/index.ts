import { celebrate, isCelebrateError } from 'celebrate'
import express, { Application, NextFunction, Request, Response } from 'express'

import { ExtendedError } from 'socket.io/dist/namespace'
import MailFetcher from '@library/common/MailFetcher'
import a from  './@types/index'
import compression from 'compression'
import cors from 'cors'
import createPaths from '@library/utilities/createPaths'
import { createSocket } from '@main/socket'
import dotenv from 'dotenv'
import errorHandler from '@main/middleware/errorHandler'
import favicon from 'serve-favicon'
import fs from 'fs'
import getCertificates from '@library/utilities/getCertificates'
import https from 'https'
import http from 'http'
import mongoose from 'mongoose'
import multer from 'multer'
import os from 'os'
import routes from '@routes/index'
import verifyToken from '@main/middleware/verifyToken'

/* Configure mongoose to allow empty strings */
const Str = mongoose.Schema.Types.String as any
Str.checkRequired((v) => v != null)

/* Init .env file */
const useProdEnv = fs.readFileSync(`${__dirname}/../.env`).includes('USE_PROD_ENV=true')
dotenv.config({ path: `${__dirname}/../.env${useProdEnv ? '.prod' : ''}` })

/* Create express app and apply middlewares */
// 50 MB limit (mainly for /smtp/send attachments)
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 50 * 1024 * 1024 } })
const app: Application = express()
app.use(express.json({ limit: '50mb' }))
app.use(cors({ origin: '*' }))
app.use(compression({ filter: (req, res) => {
	if (req.headers['x-no-compression']) return false
	return compression.filter(req, res)
} }))
app.use(favicon(`${__dirname}/public/favicon.ico`))
app.use((req, res, next) => {
	res.removeHeader('x-powered-by')
	next()
})

/* Connect to MongoDB */
mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
}).then(() => {
	console.log('Connected to MongoDB')
	/* Create required file paths in DATA_DIR */
	createPaths()

	/* Create HTTPS Server */
	const httpsServer = https.createServer(getCertificates(), app)
	const httpServer = http.createServer(app)

	/* Start MailFetcher */
	const mailFetcher = new MailFetcher()
	if (process.env.START_MAIL_FETCHER === 'true') mailFetcher.start()
	
	/* Register Routes */
	routes.forEach(registerRoute)

	/* Register WebSocket */
	createSocket(httpsServer, httpServer)

	if (process.env.USE_SSL === 'true')
		httpsServer.listen(process.env.PORT || 5000, () => console.log(`[HTTPS] Now listening on port ${process.env.PORT || 5000}`))
	else
		httpServer.listen(process.env.PORT || 5000, () => console.log(`[HTTP] Now listening on port ${process.env.PORT || 5000}`))
}).catch((error) => {
	console.error('Failed to connect to MongoDB', error)
})

export const registerRoute = (route: Noonly.Express.RouteModule) => {
	/* Wrap execute in try-catch block just in case */
	const execute = (req: Noonly.Express.UserRequest, res: Response) => {
		try {
			route.exec(req, res)
		} catch (error) {
			console.log(error)
			res.status(400).json({ error: 'Something went wrong' })
		}
	}

	const middlewares: any[] = []
	if (route.protected) middlewares.push(verifyToken)
	if (route.validate) middlewares.push(celebrate({ body: route.validate }, { }))
	if (route.upload) middlewares.push((upload as any)[route.upload.type](route.upload.options))
	middlewares.push(errorHandler)

	const props = [route.path, ...middlewares, execute]
	const registerRoute = () => (app[route.type.toLowerCase() as 'get' | 'post'] as any)(...props)
	registerRoute()
}