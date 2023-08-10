import jwt, { Secret } from 'jsonwebtoken'

import Joi from 'joi'
import userService from '@main/database/services/User.service'

export default {
	path: '/auth/login',
	type: 'POST',
	protected: false,
	validate: Joi.object({
		username: Joi.string().alphanum().min(4).max(24).required(),
		password: Joi.string().min(1).max(2048).required(),
		rememberMe: Joi.boolean().required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.AuthLogin } = req

		const user = await userService.findByLogin(body.username, body.password)
		if (!user)
			return res.status(400).json({ error: 'Invalid login credentials' })

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as Secret, { expiresIn: body.rememberMe ? '1y' : '24h' })

		res.json({
			message: 'Login successful',
			data: {
				token
			}
		} as Noonly.API.Response.AuthLogin)
	}
} as Noonly.Express.RouteModule