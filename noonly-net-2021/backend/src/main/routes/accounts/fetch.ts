import accountService from '@main/database/services/Account.service'

const allowAfter = 'Mon Oct 25 2021 17:11:27 GMT+0200 (Central European Summer Time)'

export default {
	path: '/accounts/fetch',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const _accounts = await accountService.findByOwnerId(req.user.id)
		const accounts = _accounts.map((account) => accountService.toClient(account))

		res.json({
			message: '',
			data: { accounts }
		})
	}
} as Noonly.Express.RouteModule