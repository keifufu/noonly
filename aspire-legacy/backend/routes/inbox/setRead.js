module.exports = {
	route: '/inbox/setRead',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const { items: _items, read } = req.body
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
        if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

        const items = JSON.parse(_items)
        if(!Array.isArray(items)) return res.send({ res: false, payload: 'Something went wrong' })
        const doStuff = new Promise(resolve => {
            let changed = 0
            items.forEach(async (item, index) => {
                const [mailRow] = await con.query(`SELECT * FROM mail WHERE aspire_id = '${item.aspire_id}'`)
                if(!mailRow) return res.send({ res: false, payload: 'Something went wrong' })
                if(mailRow.read === `${read}`) return
                con.query(`UPDATE mail SET isread = '${read}' WHERE aspire_id = '${item.aspire_id}'`)
                changed++
                if(index === items.length - 1) resolve(changed)
            })
        })
        doStuff.then(changed => {
            if(changed > 1) res.send({ res: true, payload: `Marked ${changed} Items as ${read ? 'read' : 'unread'}` })
            else res.send({ res: true, payload: `Marked Item as ${read ? 'read' : 'unread'}` })
        }).catch(e => res.send({ res: false, payload: e }))
	}
}