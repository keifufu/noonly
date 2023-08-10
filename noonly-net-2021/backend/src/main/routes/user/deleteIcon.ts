import { Joi } from 'celebrate'
import accountService from '@main/database/services/Account.service'
import fs from 'fs'
import getSocket from '@main/socket'
import nodePath from 'path'
import userService from '@main/database/services/User.service'

export default {
	path: '/user/deleteIcon',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		icon: Joi.string().required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.UserDeleteIcon } = req

		const response = await userService.deleteIcon(req.user.id, body.icon)

		if (response.nModified === 0)
			return res.status(400).json({ error: 'Something went wrong' })

		const iconPath = nodePath.normalize(`${process.env.DATA_DIR}/icon/${body.icon}`)
		if (fs.existsSync(iconPath)) fs.rmSync(iconPath)

		await accountService.deleteIcon(body.icon)

		res.json({
			message: 'Deleted Icon',
			data: {
				deleted: {
					icon: body.icon
				}
			}
		} as Noonly.API.Response.UserDeleteIcon)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('USER_ICON_DELETE', {
				deleted: {
					icon: body.icon
				}
			} as Noonly.API.Response.UserDeleteIconData)
		})
	}
} as Noonly.Express.RouteModule