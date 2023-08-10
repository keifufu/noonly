import axios from 'axios'
import fs from 'fs'
import nodePath from 'path'
import { serveScreenshot } from './viewRaw'

const getBase64 = (url: string) => axios.get(url, {
	responseType: 'arraybuffer'
}).then((response) => Buffer.from(response.data, 'binary').toString('base64'))

let base64: null | string = null
getBase64('https://noonly.net/public/404.png').then((res) => base64 = res).catch(() => null)

export default {
	path: '/:img',
	type: 'GET',
	protected: false,
	exec: (req, res) => {
		serveScreenshot(req, res)
		// const imgName = req.params.img?.split('.')[0]

		// const ogOptions = {
		// 	enabled: req.query.og === 'true',
		// 	description: 'A fancy screenshot',
		// 	title: 'Title',
		// 	color: '#7289DA'
		// }

		// if (ogOptions.enabled) {
		// 	const html = `
		// 		<html>
		// 			<head>
		// 				<title>${imgName} - noonly.net</title>
		// 				<meta property="og:title" content="${ogOptions.title}" />
		// 				<meta property="og:type" content="website" />
		// 				<meta property="og:url" content="https://noonly.net" />
		// 				<meta property="og:image" content="https://img.noonly.net/r/${imgName}" />
		// 				<meta property="og:description" content="${ogOptions.description}" />
		// 				<meta property="theme-color" content="${ogOptions.color}" />
		// 				<meta property="twitter:card" content="summary_large_image" />
		// 			</head>
		// 			<body style="padding: 5%; margin: 0; box-sizing: border-box; background-color: #171923; height: 100vh; display: flex; align-items: center; justify-content: center;">
		// 				<img style="max-width: 100%; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06); border-radius: 0.5rem; max-height: 100%; height: auto; width: auto;" src="https://img.noonly.net/r/${imgName}" />
		// 			</body>
		// 		</html>
		// 	`
	
		// 	res.set('Content-Type', 'text/html');
		// 	res.send(Buffer.from(html))
		// } else {
		// 	res.redirect(`https://oldimg.noonly.net/r/${imgName}`)
		// }
	}
} as Noonly.Express.RouteModule