import { NextFunction, Response } from 'express'

import jwt from 'jsonwebtoken'
import userService from '@main/database/services/User.service'

const verifyToken = async (req: Noonly.Express.UserRequest, res: Response, next: NextFunction): Promise<any> => {
	const token = req.header('Authorization') || req.query.token as string || req.body.token as string
	const imgToken = req.header('imgtoken')
	if (!token && !imgToken) return res.status(401).json({ error: 'Access Denied' })

	try {
		if (token) {
			jwt.verify(token, process.env.JWT_SECRET as any, async (err: any, decoded: any) => {
				if (err) return res.status(400).json({ error: 'Access Denied' })
				const user = await userService.findById(decoded.id)
				if (!user) return res.status(400).json({ error: 'Access Denied' })
				req.user = user
				next()
			})
		} else if (imgToken) {
			if (req.path !== '/screenshots/upload')
				return res.status(400).json({ error: 'Access Denied' })
			const user = await userService.findByImageToken(imgToken)
			if (!user) return res.status(400).json({ error: 'Access Denied' })
			req.user = user
			next()
		}
	} catch (err) {
		res.status(400).json({ error: 'Access Denied' })
	}
}

export default verifyToken