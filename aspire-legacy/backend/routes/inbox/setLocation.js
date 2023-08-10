module.exports = {
	route: '/inbox/setLocation',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const { items: _items, location } = req.body
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
        if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

        const items = JSON.parse(_items)
        if(!Array.isArray(items)) return res.send({ res: false, payload: 'Something went wrong' })
        const doStuff = new Promise(resolve => {
            let moved = 0
            items.forEach(async (item, index) => {
                const [mailRow] = await con.query(`SELECT * FROM mail WHERE aspire_id = '${item.aspire_id}'`)
                if(!mailRow) return res.send({ res: false, payload: 'Something went wrong' })
                if(mailRow.location === `${location}`) return
                con.query(`UPDATE mail SET location = '${location}' WHERE aspire_id = '${item.aspire_id}'`)
                moved++
                if(index === items.length - 1) resolve(moved)
            })
        })
        doStuff.then(moved => {
            if(moved > 1) res.send({ res: true, payload: `Moved ${moved} Items to ${location[0].toUpperCase() + location.slice(1)}` })
            else res.send({ res: true, payload: `Moved Item to ${location[0].toUpperCase() + location.slice(1)}` })
        }).catch(e => res.send({ res: false, payload: e }))
	}
}