import Joi from 'joi'
import accountService from '@main/database/services/Account.service'
import getSocket from '@main/socket'

export default {
	path: '/accounts/editNote',
	type: 'POST',
	protected: true,
	validate: Joi.object({
		note: Joi.string().min(0).max(4096).required().allow(''),
		id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
	}),
	exec: async (req, res) => {
		const { body }: { body: Noonly.API.Request.AccountEditNote } = req
		const updatedAccount = await accountService.editNote(req.user.id, body.id, body.note)

		if (!updatedAccount)
			return res.status(400).json({ error: 'Something went wrong' })

		res.json({
			message: 'Updated Note',
			data: {
				updated: {
					id: updatedAccount.id,
					note: updatedAccount.note
				}
			}
		} as Noonly.API.Response.AccountEditNote)

		getSocket()?.getSockets(req.user).forEach((socket) => {
			if (req.header('socketid') === socket.id) return
			socket.emit('ACCOUNT_EDIT_NOTE', {
				updated: {
					id: updatedAccount.id,
					note: updatedAccount.note
				}
			} as Noonly.API.Response.AccountEditNoteData)
		})
	}
} as Noonly.Express.RouteModule