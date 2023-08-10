import userService from '@main/database/services/User.service'

export default {
	path: '/user/fetch',
	type: 'POST',
	protected: true,
	exec: async (req, res) => {
		const fullUser = await userService.fetchFullUserById(req.user.id)

		res.json({
			message: '',
			data: {
				user: fullUser
			}
		})
	}
} as Noonly.Express.RouteModule