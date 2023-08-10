import { NextFunction, Request, Response } from 'express'

import { isCelebrateError } from 'celebrate'

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	if (!isCelebrateError(err))
		return next(err)

	// console.error('Body Validation failed\n', `Path: ${req.path}\n`, err)
	return res.status(400).json({ error: 'Body Validation failed' })
}

export default errorHandler