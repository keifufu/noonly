export default {
	route: '/mail/addAddress',
	middleware: false,
	type: 'post',
	user: true,
	execute: async (req, res, store, user) => {
		const { address } = req.body

		if (address.length < 1) return res.reject('Address has to be longer than 1 character')
		if (address.length > 24) return res.reject('Address can\'t be longer than 24 characters')
		if (address.match(/[^A-Za-z0-9_.]/)) return res.reject('Address can only contain A-Z 0-9 . _')
		if (['.', '_'].includes(address[0])) return res.reject('Address cannot start with a special character')
		if (['.', '_'].includes(address[address.length - 1])) return res.reject('Address cannot end with a special character')

		const mailAddress = `${address}@${process.env.HOSTNAME}`
		const [addressRow] = await store.database.mail.getAddress(mailAddress)
		if (addressRow) return res.reject('Address already exists')
		await store.database.mail.createAccount(user.id, mailAddress)

		res.sendRes({
			message: 'Added Address'
		})

		if (store.hasSocket(user.id)) {
			store.getSockets(user.id).forEach(({ socket }) => {
				socket.emit('MAIL_ADDRESS_CREATED', {
					address: mailAddress.toLowerCase(),
					origName: mailAddress
				})
			})
		}
	}
}