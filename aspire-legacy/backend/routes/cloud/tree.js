const { dirTree } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/tree',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		const userPath = nodePath.normalize(`${process.env.NODE_DIR}/data/cloud/user/${userRow.username}`)
		if(!fs.existsSync(userPath)) return res.send({ res: false, payload: 'Something went wrong' })
		const sharedPath = nodePath.normalize(`${process.env.NODE_DIR}/data/cloud/shared`)
		if(!fs.existsSync(sharedPath)) return res.send({ res: false, payload: 'Something went wrong' })

		const userTree = dirTree(userPath, nodePath.normalize(`${process.env.NODE_DIR}/data/`))
		const sharedTree = dirTree(sharedPath, nodePath.normalize(`${process.env.NODE_DIR}/data/`))
		const payload = {
			user: userTree,
			shared: sharedTree
		}

		res.send({ res: true, payload: payload })
	}
}