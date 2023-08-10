import { createExpressMiddleware } from '@trpc/server/adapters/express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { createContext } from 'src/trpc/context'
import { appRouter } from 'src/trpc/routers/_app'
import { Env } from 'src/utils/env'
import SwaggerUI from 'swagger-ui-express'
import { generateOpenApiDocument } from 'trpc-openapi'
import { runCleanupTask } from './database/cleanup'
import { expressSwaggerUiOptions } from './utils/expressSwaggerUiOptions'
import './utils/prototypeExtensions'
import { createOpenApiExpressMiddleware } from './utils/trpc-openapi/express'

/*
 * There are a few improvements we can do if database performance ever becomes a problem.
 * 1. Instead of using .count, we can have a separate model that keeps track of the counts.
 * 2. We can implement caching, like we had in NestJS.
 *   - We use Redis to store the result of a database query for a certain amount of time.
 *   - If any endpoints are called that would change cached data, we invalidate the cache.
 */

function main() {
  // Create a OpenAPI document, this allows for the tRPC router to be accessed via HTTP routes
  // and provides great documentation via Swagger UI
  const currentUrl = `https://${Env.instance.get('HOST_URL')}`
  const openApiDocument = generateOpenApiDocument(appRouter, {
    title: `${Env.instance.get('PROJECT_NAME')} API`,
    version: Env.instance.get('API_VER'),
    baseUrl: currentUrl
  })

  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', true)
  app.use(cors({
    allowedHeaders: ['Accept', 'Authorization'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
    origin: (origin, callback) => {
      // bypass the requests with no origin (like curl requests, mobile apps, etc)
      if (!origin) return callback(null, true)

      // If needed, we can allow any origin here by just returning callback(null, true)
      const allowedDomains = [currentUrl]
      if (allowedDomains.indexOf(origin) === -1) {
        console.log(`${origin} tried to access the API but was blocked by CORS`)
        return callback(null, false)
      }

      return callback(null, true)
    }
  }))
  app.use(cookieParser())
  app.use('/trpc', createExpressMiddleware({ router: appRouter, createContext, maxBodySize: 5 * 1024 * 1024 }))
  app.use('/docs', SwaggerUI.serve, SwaggerUI.setup(openApiDocument, expressSwaggerUiOptions))
  app.use('/favicon.ico', (req, res) => res.redirect('https://noonly.net/favicon.ico'))
  app.get('/', (req, res) => res.redirect('/docs'))
  app.use('/', createOpenApiExpressMiddleware({ router: appRouter, createContext, maxBodySize: 5 * 1024 * 1024 }))

  app.listen(Env.instance.get('PORT'), () => {
    console.log(`[HTTP] Listening on port ${Env.instance.get('PORT')}; Accessible at ${currentUrl}`)
  })
}

try {
  main()
  // Run db cleanup every hour
  // This will for example delete expired trash, users, etc
  setInterval(() => {
    runCleanupTask()
  }, 60 * 60 * 1000)
} catch (err) {
  console.error(`[MAIN ERROR]: ${err}`)
}