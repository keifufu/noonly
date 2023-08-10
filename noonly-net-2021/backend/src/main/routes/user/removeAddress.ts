import { Joi } from 'celebrate'
import MailDeleter from '@library/common/MailDeleter'
import addressService from '@main/database/services/Address.service'
import getSocket from '@main/socket'
import mailService from '@main/database/services/Mail.service'
import userService from '@main/database/services/User.service'

export default {
	path: '/user/removeAddress',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.UserRemoveAddress } = req

		const address = await addressService.findById(req.user.id, body.id)
		if (!address) return res.status(400).json({ error: 'Something went wrong' })

		if (address.addressLowercase === req.user.username.toLowerCase())
			return res.status(400).json({ error: 'You can\'t delete your primary address' })

		const deletedAddress = await addressService.delete(req.user.id, address.id)
		if (!deletedAddress) return res.status(400).json({ error: 'Something went wrong' })

		await userService.removeAddress(req.user.id, deletedAddress.id)

		/* Delete Contents */
		const mailToDelete = await mailService.findByAddress(req.user.id, deletedAddress.id)
		const ids = mailToDelete.map((address) => address.id)

		const mailDeleter = new MailDeleter(req.user)
		/* No need to wait for results here */
		mailDeleter.deleteMultiple(ids)

		res.json({
			message: 'Deleted address',
			data: {
				deleted: {
					id: deletedAddress.id
				}
			}
		} as Noonly.API.Response.UserRemoveAddress)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('USER_REMOVE_ADDRESS', {
				deleted: {
					id: deletedAddress.id
				}
			} as Noonly.API.Response.UserRemoveAddressData)
		})
	}
} as Noonly.Express.RouteModule