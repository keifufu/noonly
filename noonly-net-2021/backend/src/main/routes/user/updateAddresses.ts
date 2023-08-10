import { Joi } from 'celebrate'
import addressService from '@main/database/services/Address.service'
import getSocket from '@main/socket'

export default {
	path: '/user/updateAddresses',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		order: Joi.object().pattern(Joi.string().regex(/^[0-9a-fA-F]{24}$/), Joi.number()).required(),
		visible: Joi.object().pattern(Joi.string().regex(/^[0-9a-fA-F]{24}$/), Joi.boolean()).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.UserUpdateAddresses } = req

		const updateDatabase = (): Promise<{ order: Noonly.API.Data.UserAddressOrder, visible: Noonly.API.Data.UserAddressVisibility }> => new Promise((resolve) => {
			const updated: { order: Noonly.API.Data.UserAddressOrder, visible: Noonly.API.Data.UserAddressVisibility } = { order: {}, visible: {} }
			let processed = 0
			/* Don't iterate over `visible`, it can contain deleted addressId's, unlike order */
			Object.keys(body.order).forEach(async (addressId) => {
				const updatedAddress = await addressService.update(req.user.id, addressId, body.order[addressId], body.visible[addressId])

				processed += 1
				/* Address failed to update, don't add to `updated` object */
				if (!updatedAddress) return

				updated.order[addressId] = body.order[addressId]
				updated.visible[addressId] = body.visible[addressId]
				if (processed === Object.keys(body.order).length)
					resolve(updated)
			})
		})

		const updated = await updateDatabase()

		res.json({
			message: 'Updated Addresses',
			data: {
				updated: {
					order: updated.order,
					visible: updated.visible
				}
			}
		} as Noonly.API.Response.UserUpdateAddresses)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('USER_UPDATE_ADDRESSES', {
				updated: {
					order: updated.order,
					visible: updated.visible
				}
			} as Noonly.API.Response.UserUpdateAddressesData)
		})
	}
} as Noonly.Express.RouteModule