const { generateToken } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/passwords/setIcon',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const { id, image } = req.body
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })
		const [passwordRow] = await con.query(`SELECT * FROM passwords WHERE account_username = '${userRow.username}' AND id = '${id}'`)
		if(!passwordRow) return res.send({ res: false, payload: 'Something went wrong' })
		try {
			if(passwordRow.icon !== 'null') fs.unlinkSync(`${process.env.WWW_DIR}/ss/${userRow.username}/icons/${passwordRow.icon}`)
			const regex = /^data:.+\/(.+);base64,(.*)$/;
			const matches = image.match(regex)
			const ext = matches[1].toLowerCase()
			if(!['jpg', 'jpeg', 'jfif', 'png', 'webm', 'gif'].includes(ext)) return res.send({ res: false, payload: 'Invalid file type' })
			const data = matches[2]
			const name = `${generateToken(7)}.${ext}`
			const path = nodePath.normalize(`${process.env.WWW_DIR}/ss/${userRow.username}/icons/${name}`)
			fs.writeFile(path, data, { encoding: 'base64' }, err =>  {
				if(err) return res.send({ res: false, payload: 'Something went wrong' })
				con.query(`UPDATE passwords SET icon = '${name}' WHERE account_username = '${userRow.username}' AND id = '${id}'`)
				res.send({ res: true, payload: 'Updated Icon' })
			})
		} catch(e) { res.send({ res: false, payload: 'Something went wrong' }) }
	}
}