import { ScreenshotDocument } from '@main/database/models/Screenshot.model'
import fs from 'fs'
import getSocket from '@main/socket'
import mv from 'mv'
import nodePath from 'path'
import randomToken from '@library/utilities/randomToken'
import screenshotService from '@main/database/services/Screenshot.service'
import sharp from 'sharp'

interface Image extends Express.Multer.File {
	ext?: string,
	name?: string
}

export default {
	path: '/screenshots/upload',
	type: 'POST',
	protected: true,
	upload: {
		type: 'single',
		options: 'image'
	},
	exec: (req, res) => {
		if (!req.file) return res.status(400).json({ error: 'No image was uploaded' })

		const image: Image = req.file
		image.ext = image.mimetype.split('/')[1]
		if (image.ext === 'jpeg') image.ext = 'jpg'
		if (!['jpg', 'png', 'webp', 'avif', 'gif', 'svg', 'tiff'].includes(image.ext))
			return res.status(400).json({ error: `.${image.ext} files are not supported` })
		if (['jpg', 'gif'].includes(image.ext))
			saveImage(image)
		else
			convertImage(image)

		async function convertImage(image: Image) {
			const newPath = nodePath.normalize(`${image.path}.jpg`)
			await sharp(image.path)
				.jpeg({ quality: 100 })
				.toFile(newPath)
			fs.rmSync(image.path)
			image.path = newPath
			image.ext = 'jpg'
			saveImage(image)
		}

		async function saveImage(image: Image) {
			image.name = randomToken(10)
			const savedScreenshot = await screenshotService.create(req.user.id, image.name, image.ext as string, fs.statSync(image.path).size)

			const imagePath = nodePath.normalize(`${process.env.DATA_DIR}/img/${image.name}.${image.ext}`)
			mv(image.path, imagePath, () => {
				image.path = imagePath
				generatePreviewImage(image, savedScreenshot)
			})
		}

		async function generatePreviewImage(image: Image, savedScreenshot: ScreenshotDocument) {
			const previewImagePath = nodePath.normalize(`${process.env.DATA_DIR}/img/previews/preview_${image.name}.webp`)
			await sharp(image.path)
				.resize(300, 200, {
					kernel: sharp.kernel.nearest,
					fit: 'cover'
				})
				.webp({ nearLossless: true })
				.toFile(previewImagePath)

			res.send(`https://oldimg.${process.env.HOSTNAME}/${image.name}.${image.ext}`)

			getSocket()?.getSockets(req.user).forEach((socket) => {
				if (req.header('socketid') === socket.id) return
				socket.emit('SCREENSHOT_UPLOAD', {
					screenshot: screenshotService.toClient(savedScreenshot)
				})
			})
		}
	}
} as Noonly.Express.RouteModule