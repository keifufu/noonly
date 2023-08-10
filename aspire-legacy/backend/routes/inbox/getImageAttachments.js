const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/inbox/getImageAttachments',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const { token, item: _item } = req.body
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
        if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

        const images = []
        const item = JSON.parse(_item)
        if(!item || !item.attachments) return res.send({ res: true, payload: images })
        item.attachments.forEach(e => {
            const path = nodePath.normalize(e.path)
            const ext = nodePath.extname(path)
            if(!['.jpg', '.jpeg', '.jfif', '.png', '.webm', '.gif'].includes(ext)) return
			const base64 = fs.readFileSync(path, { encoding: 'base64' })
			const image = `data:image/${nodePath.extname(path).replace('.', '')};base64,${base64}`
            images.push({ cid: e.cid, data: image })
        })
        res.send({ res: true, payload: images })
	}
}