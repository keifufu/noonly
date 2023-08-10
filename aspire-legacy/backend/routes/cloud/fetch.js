const { tree } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/cloud/fetch',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		const path = req.body.path === '/' ? '' : req.body.path
		const userPath = nodePath.normalize(`${process.env.NODE_DIR}/data/cloud/user/${userRow.username}${req.body.location === 'user' ? path : ''}`)
		if(!fs.existsSync(userPath)) return res.send({ res: false, payload: 'Something went wrong' })
		const trashPath = nodePath.normalize(`${process.env.NODE_DIR}/data/cloud/trash/${userRow.username}${req.body.location === 'trash' ? path : ''}`)
		if(!fs.existsSync(trashPath)) return res.send({ res: false, payload: 'Something went wrong' })
		const sharedPath = nodePath.normalize(`${process.env.NODE_DIR}/data/cloud/shared${req.body.location === 'shared' ? path : ''}`)
		if(!fs.existsSync(sharedPath)) return res.send({ res: false, payload: 'Something went wrong' })

		if(req.body.location === 'user') {
			const userTree = await tree(userPath, userRow.username, 0, 1)
			res.send({ res: true, payload: { user: userTree } })
		} else if(req.body.location === 'trash') {
			const trashTree =  await tree(trashPath, userRow.username, 0, 1)
			res.send({ res: true, payload: { trash: trashTree } })
		} else if(req.body.location === 'shared') {
			const sharedTree = await tree(sharedPath, 'shared', 0, 1)
			res.send({ res: true, payload: { shared: sharedTree } })
		} else res.send({ res: false, payload: 'Something went wrong' })
	}
}