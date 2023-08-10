import addressService from '@main/database/services/Address.service'

export default {
	path: '/smtp/get-addresses',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
        addressService.findByUserId(req.user.id).catch(() => {
			return res.json({ success: false, addresses: [] })
		}).then((addresses) => {
			return res.json({ success: true, addresses })
		})
	}
} as Noonly.Express.RouteModule