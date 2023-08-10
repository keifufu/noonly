import getSocket from '@main/socket'
import mailService from '@main/database/services/Mail.service'

const allowAfter = 'Mon Oct 25 2021 17:11:27 GMT+0200 (Central European Summer Time)'

export default {
	event: 'REFRESH_MAIL',
	exec: async (data, socket) => {
		const _mail = await mailService.findByOwnerId(socket.user.id)
		const mail = _mail.filter((mail) => !data.loadedIds.includes(mail.id)).map((mail) => mailService.toClient(mail))

		/* Execute this event on ALL sockets, to keep them in sync when the new mail gets changed */
		getSocket()?.getSockets(socket.user).forEach((socket) => {
			socket.emit('MAIL_REFRESHED', { mail })
		})
	}
} as Noonly.Socket.SocketHandler