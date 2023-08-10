module.exports = {
	route: '/screenshots/setFavorite',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [row] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!row) return res.send({ res: false, payload: 'Something went wrong' })

		con.query(`UPDATE screenshots SET favorite = '${req.body.favorite}' WHERE id = '${req.body.id}'`)
		res.send({ res: true, payload: req.body.favorite === 'true' ? 'Added to favorites' : 'Removed from favorites' })
	}
}