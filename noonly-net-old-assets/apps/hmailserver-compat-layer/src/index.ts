import authMiddleware from './middleware/auth'
import dotenv from 'dotenv'
import express from 'express'
import registerRoutes from './routes'

dotenv.config()

const app = express()
app.use(authMiddleware)

registerRoutes(app)

app.listen(process.env.PORT)