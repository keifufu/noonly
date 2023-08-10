import cookieParser from 'cookie-parser'
import * as fs from 'fs'
import helmet from 'helmet'
import csurf from 'csurf'

import { HttpAdapterHost, NestFactory } from '@nestjs/core'

import { AllExceptionsFilter } from './utils/AllExceptions.filter'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { getRedisIoAdapter } from './utils/getRedisIoAdapter'
import { runInCluster } from './utils/runInCluster'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		httpsOptions: {
			key: fs.readFileSync(`${__dirname}/../ssl/ssl.key.pem`),
			cert: fs.readFileSync(`${__dirname}/../ssl/ssl.crt.pem`),
			ca: fs.readFileSync(`${__dirname}/../ssl/ssl.ca.pem`)
		}
	})

	app.useGlobalPipes(new ValidationPipe({
		transform: true
	}))

	const configService = app.get(ConfigService)

	app.enableCors({
		origin: configService.get('CORS_ORIGIN'),
		credentials: true
	})

	/*
	 * Makes express trust (X-Forwarded-For, X-Forwarded-Proto) headers, set by a reverse proxy
	 * Don't use this if the app is not running behind a reverse proxy, since then the user may set these headers and spoof their address
	 */
	if (configService.get('IS_USING_PROXY'))
		app.enable('trust proxy')

	app.use(cookieParser())
	app.use(helmet())
	if (configService.get('NODE_ENV') === 'production') {
		app.use(csurf({
			cookie: {
				key: '_csrf',
				path: '/',
				signed: false,
				secure: true,
				maxAge: 60,
				httpOnly: true,
				sameSite: false
			}
		}))
	}

	const { httpAdapter } = app.get(HttpAdapterHost)
	app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))

	const RedisIoAdapter = getRedisIoAdapter(configService.get('REDIS_HOST'), configService.get('REDIS_PORT'))
	app.useWebSocketAdapter(new RedisIoAdapter(app))

	await app.listen(configService.get('PORT'))
}
runInCluster(bootstrap)