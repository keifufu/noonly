module.exports = {
	route: '/inbox/setFavorite',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const { items: _items, favorite } = req.body
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
        if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

        const items = JSON.parse(_items)
        if(!Array.isArray(items)) return res.send({ res: false, payload: 'Something went wrong' })
        const doStuff = new Promise(resolve => {
            let removed = 0
            items.forEach(async (item, index) => {
                const [mailRow] = await con.query(`SELECT * FROM mail WHERE aspire_id = '${item.aspire_id}'`)
                if(!mailRow) return res.send({ res: false, payload: 'Something went wrong' })
                if(mailRow.favorite === `${favorite}`) return
                con.query(`UPDATE mail SET favorite = '${favorite}' WHERE aspire_id = '${item.aspire_id}'`)
                removed++
                if(index === items.length - 1) resolve(removed)
            })
        })
        doStuff.then(removed => {
            if(removed > 1) res.send({ res: true, payload: `${favorite ? 'Added' : 'Removed'} ${removed} Items ${favorite ? 'to' : 'from'} favorite` })
            else res.send({ res: true, payload: `${favorite ? 'Added' : 'Removed'} Item ${favorite ? 'to' : 'from'} favorites` })
        }).catch(e => res.send({ res: false, payload: e }))
	}
}