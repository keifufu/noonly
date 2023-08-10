import { Express } from 'express'
import registerCreate from './create'

const registerRoutes = (app: Express) => {
	registerCreate(app)
}

export default registerRoutes