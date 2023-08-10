import fs from 'fs'
import getLimitsByUser from '@library/utilities/getLimitsByUser'
import getSocket from '@main/socket'
import mv from 'mv'
import nodePath from 'path'
import randomToken from '@library/utilities/randomToken'
import sharp from 'sharp'
import userService from '@main/database/services/User.service'

interface Image extends Express.Multer.File {
	ext?: string,
	name?: string
}

export default {
	path: '/user/uploadIcon',
	type: 'POST',
	protected: true,
	upload: {
		type: 'single',
		options: 'image'
	},
	exec: async (req, res) => {
		if (!req.file) return res.status(400).json({ error: 'No image was uploaded' })

		const image: Image = req.file
		/* Check if user will exceed maximum number of allowed icons */
		const user = await userService.findById(req.user.id)
		const iconLimit = getLimitsByUser(req.user).icons
		if ((user?.icons.length || 0) + 1 > iconLimit)
			return res.status(400).json({ error: `You can not upload more than ${iconLimit} icons` })

		image.ext = image.mimetype.split('/')[1]
		if (!['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg', 'tiff'].includes(image.ext))
			return res.status(400).json({ error: `.${image.ext} files are not supported` })
		convertImage(image)

		async function convertImage(image: Image) {
			const newPath = nodePath.normalize(`${image.path}.jpg`)
			await sharp(image.path, { animated: true })
				.webp({ quality: 100 })
				.toFile(newPath)
			fs.rmSync(image.path)
			image.path = newPath
			image.ext = 'webp'
			saveImage(image)
		}

		async function saveImage(image: Image) {
			image.name = randomToken(10)
			await userService.addIcon(req.user.id, `${image.name}.${image.ext}`)
			const imagePath = nodePath.normalize(`${process.env.DATA_DIR}/icon/${image.name}.${image.ext}`)
			mv(image.path, imagePath, () => {
				image.path = imagePath
				res.json({
					message: 'Uploaded Icon',
					data: {
						updated: {
							icon: `${image.name}.${image.ext}`
						}
					}
				} as Noonly.API.Response.UserUploadIcon)

				getSocket()?.getSockets(req.user).forEach((socket) => {
					if (req.header('socketid') === socket.id) return
					socket.emit('USER_ICON_UPLOAD', {
						updated: {
							icon: `${image.name}.${image.ext}`
						}
					} as Noonly.API.Response.UserUploadIconData)
				})
			})
		}
	}
} as Noonly.Express.RouteModule