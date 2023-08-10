import deleteMail from '#library/common/deleteMail'

export default {
	route: '/mail/deleteAddress',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { address } = req.body

		if (address.toLowerCase() === `${user.username.toLowerCase()}@${process.env.HOSTNAME}`)
			return res.reject('You can\'t to delete this Address')

		const [addressRow] = await store.database.mail.getAddressByIdAndAddress(user.id, address)
		if (!addressRow) return res.reject()

		store.database.mail.removeAccount(user.id, address)

		const mailToDelete = await store.database.mail.getAllByAddress(address)

		mailToDelete.forEach(({ id }) => {
			deleteMail(store, user.id, id)
		})

		res.sendRes({
			message: 'Deleted Address'
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('MAIL_ADDRESS_DELETED', {
					address: address.toLowerCase()
				})
			})
		}
	}
}