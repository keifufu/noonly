import jwt, { Secret } from 'jsonwebtoken'

import Joi from 'joi'
import addressService from '@main/database/services/Address.service'
import userService from '@main/database/services/User.service'

export default {
	path: '/auth/register',
	type: 'POST',
	protected: false,
	validate: Joi.object({
		username: Joi.string().alphanum().min(4).max(24).required(),
		password: Joi.string().min(1).max(2048).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.AuthRegister } = req

		if (process.env.DISABLE_REGISTRATIONS === 'true')
			return res.status(400).json({ error: 'Registrations are currently disabled' })

		const doesUsernameExist = await userService.findByUsername(body.username)
		if (doesUsernameExist) return res.status(400).json({ error: 'Username is already taken' })

		const userAddress = body.username
		const doesAddressExist = await addressService.findByAddress(userAddress)
		if (doesAddressExist) return res.status(400).json({ error: 'Username is already taken' })

		const newAddress = await addressService.create(userAddress, body.username, 0)
		const newUser = await userService.create(body.username, body.password, newAddress.id)
		await addressService.assignOwner(newAddress.id, newUser.id)

		const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET as Secret, { expiresIn: '7d' })

		res.json({
			message: 'Registered successfully',
			data: {
				token
			}
		} as Noonly.API.Response.AuthRegister)
	}
} as Noonly.Express.RouteModule