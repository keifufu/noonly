import fs from 'fs'
import nodePath from 'path'

const createPaths = (): void => {
	/* Data Root */
	const path = nodePath.normalize(process.env.DATA_DIR as string)
	if (!fs.existsSync(path)) fs.mkdirSync(path)

	/* Screenshots */
	const imgPath = nodePath.normalize(`${path}/img`)
	if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath)

	const imgPreviewsPath = nodePath.normalize(`${path}/img/previews`)
	if (!fs.existsSync(imgPreviewsPath)) fs.mkdirSync(imgPreviewsPath)

	/* Mail */
	const mailPath = nodePath.normalize(`${path}/mail`)
	if (!fs.existsSync(mailPath)) fs.mkdirSync(mailPath)

	const mailJsonPath = nodePath.normalize(`${path}/mail/json`)
	if (!fs.existsSync(mailJsonPath)) fs.mkdirSync(mailJsonPath)

	const mailEmlPath = nodePath.normalize(`${path}/mail/eml`)
	if (!fs.existsSync(mailEmlPath)) fs.mkdirSync(mailEmlPath)

	const mailAttachmentsPath = nodePath.normalize(`${path}/mail/attachments`)
	if (!fs.existsSync(mailAttachmentsPath)) fs.mkdirSync(mailAttachmentsPath)

	/* Avatar */
	const avatarPath = nodePath.normalize(`${path}/avatar`)
	if (!fs.existsSync(avatarPath)) fs.mkdirSync(avatarPath)

	/* Icon */
	const iconPath = nodePath.normalize(`${path}/icon`)
	if (!fs.existsSync(iconPath)) fs.mkdirSync(iconPath)

	/* Cloud */
	const cloudPath = nodePath.normalize(`${path}/cloud`)
	if (!fs.existsSync(cloudPath)) fs.mkdirSync(cloudPath)

	/* Continue */
}

export default createPaths