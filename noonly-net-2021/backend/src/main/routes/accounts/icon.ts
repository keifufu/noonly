import fs from 'fs'
import nodePath from 'path'

export default {
	path: '/icon/:icon',
	type: 'GET',
	protected: false,
	exec: (req, res) => {
		const avatarPath = nodePath.normalize(`${process.env.DATA_DIR}/icon/${req.params.icon}`)
		if (!fs.existsSync(avatarPath)) return res.end()

		res.sendFile(avatarPath)
	}
} as Noonly.Express.RouteModule