import { Joi } from 'celebrate'
import addressService from '@main/database/services/Address.service'
import getLimitsByUser from '@library/utilities/getLimitsByUser'
import getSocket from '@main/socket'
import userService from '@main/database/services/User.service'

export default {
	path: '/user/addAddress',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		address: Joi.string().min(4).max(40).regex(/^[A-Za-z0-9_.]+$/).custom((value, helper) => {
			if (['.', '_'].includes(value[0]))
				return helper.message('"address" must not start with a . or a _' as any)
			if (['.', '_'].includes(value[value.length - 1]))
				return helper.message('"address" must not end with a . or a _' as any)
			return value
		}).required(),
		name: Joi.string().min(1).max(64).alphanum().required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.UserAddAddress } = req

		const user = await userService.findById(req.user.id)
		if (!user) return res.status(400).json({ error: 'Something went wrong' })
		const addressLimit = getLimitsByUser(user).addresses
		if (user.addresses.length + 1 > addressLimit)
			return res.status(400).json({ error: `You can not have more than ${addressLimit} addresses` })

		const doesAddressExist = await addressService.findByAddress(body.address)
		if (doesAddressExist) return res.status(400).json({ error: 'Address is already registered' })

		const newAddress = await addressService.create(body.address, body.name, user.addresses.length, req.user.id)

		await userService.addAddress(user.id, newAddress.id)

		res.json({
			message: 'Added address',
			data: {
				address: {
					...addressService.toClient(newAddress),
					unread: 0
				}
			}
		} as Noonly.API.Response.UserAddAddress)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('USER_ADD_ADDRESS', {
				address: {
					...addressService.toClient(newAddress),
					unread: 0
				}
			} as Noonly.API.Response.UserAddAddressData)
		})
	}
} as Noonly.Express.RouteModule