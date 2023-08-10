import fs from 'fs'
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
	path: '/user/uploadAvatar',
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
			/* Delete old avatar */
			const user = await userService.findById(req.user.id)
			const avatarPath = nodePath.normalize(`${process.env.DATA_DIR}/avatar/${user?.avatar}`)
			if (fs.existsSync(avatarPath)) fs.rmSync(avatarPath)

			/* Save new avatar */
			image.name = randomToken(10)
			await userService.updateAvatar(req.user.id, `${image.name}.${image.ext}`)
			const imagePath = nodePath.normalize(`${process.env.DATA_DIR}/avatar/${image.name}.${image.ext}`)
			mv(image.path, imagePath, () => {
				image.path = imagePath
				res.json({
					message: 'Updated Avatar',
					data: {
						updated: {
							avatar: `${image.name}.${image.ext}`
						}
					}
				} as Noonly.API.Response.UserUploadAvatar)

				getSocket()?.getSockets(req.user).forEach((socket) => {
					if (req.header('socketid') === socket.id) return
					socket.emit('USER_AVATAR_UPDATE', {
						updated: {
							avatar: `${image.name}.${image.ext}`
						}
					} as Noonly.API.Response.UserUploadAvatarData)
				})
			})
		}
	}
} as Noonly.Express.RouteModule