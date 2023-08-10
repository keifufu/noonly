const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/inbox/delete',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const { items: _items } = req.body
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
        if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

        const items = JSON.parse(_items)
        if(!Array.isArray(items)) return res.send({ res: false, payload: 'Something went wrong' })
        const doStuff = new Promise(resolve => {
            let deleted = 0
            items.forEach(async (item, index) => {
                const [mailRow] = await con.query(`SELECT * FROM mail WHERE aspire_id = '${item.aspire_id}'`)
                if(!mailRow) return res.send({ res: false, payload: 'Something went wrong' })
                try {
                    const originalPath = nodePath.normalize(mailRow.originalPath)
                    const path = nodePath.normalize(mailRow.path)
                    if(fs.existsSync(originalPath)) fs.unlinkSync(originalPath)
                    if(fs.existsSync(path)) fs.unlinkSync(path)
                    con.query(`DELETE FROM mail WHERE aspire_id = '${item.aspire_id}'`)
                } catch(e) { console.log(e) }
                deleted++
                if(index === items.length - 1) resolve(deleted)
            })
        })
        doStuff.then(deleted => {
            if(deleted > 1) res.send({ res: true, payload: `Deleted ${deleted} Items` })
            else res.send({ res: true, payload: 'Deleted Item' })
        }).catch(e => res.send({ res: false, payload: e }))
	}
}