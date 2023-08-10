export default {
	path: '/alive',
	type: 'GET',
	protected: false,
	exec: (req, res) => {
		res.send('Yay')
	}
} as Noonly.Express.RouteModule