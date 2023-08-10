import mailService from '@main/database/services/Mail.service'
import addressService from '@main/database/services/Address.service'

const allowAfter = 'Mon Oct 25 2021 17:11:27 GMT+0200 (Central European Summer Time)'

export default {
	event: 'LOAD_MAIL',
	exec: async (data, socket) => {
		const _mail = await mailService.findByOwnerId(socket.user.id)
		const mail = _mail.map((mail) => mailService.toClient(mail))

		socket.emit('MAIL_LOADED', { mail })
	}
} as Noonly.Socket.SocketHandler