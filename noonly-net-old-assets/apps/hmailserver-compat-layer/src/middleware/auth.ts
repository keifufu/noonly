import { NextFunction, Request, Response } from 'express'

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const authorizationHeader = req.header('Authorization')

	if (authorizationHeader !== process.env.AUTH_TOKEN) {
		res.status(401)
		res.json({ error: 'Unauthorized' })
		return
	}

	next()
}

export default authMiddleware