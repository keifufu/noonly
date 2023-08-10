import Joi from 'joi'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const atPng = Buffer.from(fs.readFileSync(path.resolve('./src/main/routes/accounts/at.png'), { encoding: 'base64' }), 'base64')

const getBase64 = (url: string) => axios.get(url, {
	responseType: 'arraybuffer'
}).then((response) => Buffer.from(response.data, 'binary').toString('base64'))

const cache = {}

interface IconType {
	url: string,
	width: number,
	height: number,
	format: string,
	bytes: number,
	error: null | string,
	sha1sum: string,
	fallback?: boolean
}

export default {
	path: '/accounts/favicon',
	type: 'GET',
	protected: false,
	validate: Joi.object({
		site: Joi.string().min(1).required()
	}),
	exec: async (req, res) => {
		//const site = (req.query.site as string)?.split('.').slice(-2).join('.').split(" ").join("")
		const site = (req.query.site as string)?.split(" ").join("")

		if (site.startsWith('@')) {
			res.writeHead(200, {
				'Content-Type': 'image/png',
				'Content-Length': atPng.length
			 });			 

			return res.end(atPng)
		}

		if (cache[site]) {
			res.type('image/png')
			res.send(cache[site])
			return
		}

		try {
			// const img = Buffer.from(await getBase64(`https://aware-tomato-barracuda.faviconkit.com/${site}/256`), 'base64')
			const img = Buffer.from(await getBase64(`https://icons.duckduckgo.com/ip3/${site}.ico`), 'base64')
			res.type('image/png')
			res.send(img)
			cache[site] = img
		} catch (e) {
			res.redirect(`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${site}&size=256`)
		}

		return
		
		if (cache[site]) {
			res.type('image/png')
			res.send(cache[site])
			return
		}
		
		const response = await axios.post(`http://${process.env.BESTICON_HOST}:${process.env.BESTICON_PORT}/allicons.json?url=${site}`)

		let finalIcon = {
			url: `http://${process.env.BESTICON_HOST}:${process.env.BESTICON_PORT}/lettericons/${site[0].toUpperCase()}-120.png`,
			width: 120,
			height: 120,
			format: 'png',
			fallback: true
		} as Partial<IconType>

		response.status === 200 && response.data.icons.forEach((icon: IconType) => {
			/* Return if icon is less than 32 pixels */
			if (icon.width < 32 || icon.height < 32) return
			/* Return if finalIcon is already bigger or equal to 256 pixels and it isn't fallback */
			if (finalIcon.width >= 256 && !finalIcon.fallback) return
			/* Return if icon is bigger than 1024 pixels and we already found an icon that isn't fallback */
			if ((icon.width > 1024 || icon.height > 1024) && !finalIcon.fallback) return
			/* Return if icon is smaller than finalIcon and finalIcon is not fallback */
			if ((icon.width < finalIcon.width || icon.height < finalIcon.height) && !finalIcon.fallback) return
			/* Set current icon as finalIcon */
			finalIcon = icon
		})

		try {
			const img = Buffer.from(await getBase64(finalIcon.url), 'base64')
			res.type('image/png')
			res.send(img)
			cache[site] = img
		} catch (e) {
			res.end()
		}
		
	}
} as Noonly.Express.RouteModule