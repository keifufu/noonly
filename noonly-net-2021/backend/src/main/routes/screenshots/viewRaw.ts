import axios from 'axios'
import { Request, Response } from 'express'
import fs from 'fs'
import nodePath from 'path'

const getBase64 = (url: string) => axios.get(url, {
	responseType: 'arraybuffer'
}).then((response) => Buffer.from(response.data, 'binary').toString('base64'))

let base64: null | string = null
getBase64('https://noonly.net/public/404.png').then((res) => base64 = res).catch(() => null)

export default {
	path: '/r/:img',
	type: 'GET',
	protected: false,
	exec: (req, res) => {
		serveScreenshot(req, res)
	}
} as Noonly.Express.RouteModule

export function serveScreenshot(req: Request, res: Response) {
	const imgName = req.params.img?.split('.')[0]
		if (!imgName) {
			const img = Buffer.from(base64, 'base64')
			res.type('image/png')
			res.send(img)
		}

		/* Don't bother wasting time looking the img up in the database. */
		const isPreview = req.params.img.includes('preview')
		let path = null
		if (isPreview) {
			path = nodePath.normalize(`${process.env.DATA_DIR}/img/previews/${imgName}.webp`)
		} else {
			path = nodePath.normalize(`${process.env.DATA_DIR}/img/${imgName}.jpg`)
			if (!fs.existsSync(path))
				path = nodePath.normalize(`${process.env.DATA_DIR}/img/${imgName}.gif`)
		}

		let imgSrc
		if (fs.existsSync(path)) {
			imgSrc = `data:image/gif;base64,${fs.readFileSync(path, 'base64')}`
		} else {
			imgSrc = Buffer.from(base64, 'base64')
		}

		if (fs.existsSync(path)) {
			res.sendFile(path)
		} else {
			const img = Buffer.from(base64, 'base64')
			res.type('image/png')
			res.send(img)
		}
}