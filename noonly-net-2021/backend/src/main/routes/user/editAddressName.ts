import { Joi } from 'celebrate'
import addressService from '@main/database/services/Address.service'
import getSocket from '@main/socket'

export default {
	path: '/user/editAddressName',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		name: Joi.string().min(1).max(64).alphanum().required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.UserEditAddressName } = req

		const updatedAddress = await addressService.editName(req.user.id, body.id, body.name)

		if (!updatedAddress)
			return res.status(400).json({ error: 'Something went wrong' })

		res.json({
			message: 'Updated Name',
			data: {
				updated: {
					id: body.id,
					name: body.name
				}
			}
		} as Noonly.API.Response.UserEditAddressName)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('USER_EDIT_ADDRESS_NAME', {
				updated: {
					id: body.id,
					name: body.name
				}
			} as Noonly.API.Response.UserEditAddressNameData)
		})
	}
} as Noonly.Express.RouteModule