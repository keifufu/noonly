import fs from 'fs'
import nodePath from 'path'

export default {
	path: '/avatar/:avatar',
	type: 'GET',
	protected: false,
	exec: (req, res) => {
		const avatarPath = nodePath.normalize(`${process.env.DATA_DIR}/avatar/${req.params.avatar}`)
		if (!fs.existsSync(avatarPath)) return res.end()

		res.sendFile(avatarPath)
	}
} as Noonly.Express.RouteModule