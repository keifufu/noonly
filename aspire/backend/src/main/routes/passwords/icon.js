import axios from 'axios'

export default {
	route: '/passwords/icon',
	middleware: false,
	type: 'get',
	user: false,
	execute: async (req, res, store) => {
		const { site } = req.query

		if (typeof site !== 'string') return res.reject('Invalid Request')

		const icon = await getBase64(`http://localhost:8080/icon?url=${site}&size=32..64..128`)
		const img = Buffer.from(icon, 'base64')

		res.type('image/png')
		res.send(img)
	}
}

function getBase64(url) {
	return axios.get(url, {
		responseType: 'arraybuffer'
	}).then((response) => Buffer.from(response.data, 'binary').toString('base64'))
}