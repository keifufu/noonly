const metascraper = require('metascraper')([
	require('metascraper-author')(),
	require('metascraper-description')(),
	require('metascraper-image')(),
	require('metascraper-logo')(),
	require('metascraper-clearbit')(),
	require('metascraper-title')(),
	require('metascraper-publisher')(),
	require('metascraper-soundcloud')(),
	require('metascraper-spotify')(),
	require('metascraper-video')()
])
const got = require('got')

module.exports = {
	route: '/metadata',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		got(req.body.url).then(async ({ body: html, url }) => {
			const metadata = await metascraper({ html, url })
			res.send({ res: true, payload: metadata })
		}).catch(err => {
			res.send({ res: false, payload: err.message })
		})
	}
}