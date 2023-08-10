export default {
	route: '/mail/setOrderAndVisibility',
	middleware: false,
	type: 'post',
	user: true,
	execute: (req, res, store, user) => {
		const { order, visible } = req.body

		const newOrder = {}

		order.forEach((address, index) => {
			newOrder[address.toLowerCase()] = index
			store.database.mail.setOrder(user.id, address, index)
		})

		Object.keys(visible).forEach((key) => {
			store.database.mail.setVisible(user.id, key, visible[key])
		})

		res.sendRes({
			message: 'Updated Addresses'
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('MAIL_ORDER_AND_VISIBILITY_UPDATE', {
					order: newOrder,
					visible
				})
			})
		}
	}
}