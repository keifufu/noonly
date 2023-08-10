import AddressModel, { AddressDocument } from '@main/database/models/Address.model'
import mysql, { Connection } from 'promise-mysql'

import AccountModel from '@main/database/models/Account.model'
import MailModel from '@main/database/models/Mail.model'
import ScreenshotModel from '@main/database/models/Screenshot.model'
import UserModel from '@main/database/models/User.model'
import createPaths from '@library/utilities/createPaths'
import dotenv from 'dotenv'
import fs from 'fs'
import mongoose from 'mongoose'
import mv from 'mv'
import nodePath from 'path'
import randomToken from '@library/utilities/randomToken'
import sharp from 'sharp'

const useProdEnv = fs.readFileSync(`${__dirname}/../.env`).includes('USE_PROD_ENV=true')
dotenv.config({ path: `${__dirname}/../.env${useProdEnv ? '.prod' : ''}` })

createPaths()

/* Configure mongoose to allow empty strings */
const Str = mongoose.Schema.Types.String as any
Str.checkRequired((v) => v != null)

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
}).then(() => {
	console.log('Connected to MongoDB')
	mysql.createConnection({
		host: 'localhost',
		port: 3306,
		user: 'noonly',
		password: '%8vDuQRU^x^voc&nydvi0FSM',
		database: 'noonly',
		charset: 'utf8mb4_unicode_ci'
	}).then((con) => {
		console.log('Connected to MariaDB')
		const dataConverter = new DataConverter(con)
		dataConverter.start()
	}).catch((error) => {
		console.error('Failed to connect to MariaDB', error)
	})
}).catch((error) => {
	console.error('Failed to connect to MongoDB', error)
})

class DataConverter {
	con: Connection

	constructor(con) {
		this.con = con
	}

	async start() {
		const userMap = await this.convertUsers()
		this.convertAccounts(userMap)
		this.convertScreenshots(userMap)
		this.convertMail(userMap)
	}

	convertMail(userMap) {
		Object.keys(userMap).forEach(async (oldUserId) => {
			const newUser = userMap[oldUserId]
			const oldMails = await this.con.query('SELECT * FROM mail WHERE user_id = ?', [oldUserId])
			console.log('Found', oldMails.length, 'mails for oldUserId:', oldUserId)

			oldMails.forEach(async (oldMail) => {
				const address = await AddressModel.findOne({ addressLowercase: oldMail.to_address.split('@')[0].toLowerCase() })
				if (!address) return console.error('Failed to find address for oldMailId:', oldMail.id)

				const oldMailJsonPath = nodePath.normalize(`D:/data2/mail/${oldMail.id}.json`)
				if (!fs.existsSync(oldMailJsonPath)) return console.error('Failed to find json path for oldMailId:', oldMail.id)
				const oldMailJson = JSON.parse(fs.readFileSync(oldMailJsonPath).toString())

				const newMail = new MailModel({
					ownerId: newUser.id,
					subject: oldMailJson.subject,
					previewText: oldMailJson.text?.substr(0, 250) || '',
					from: `${oldMailJson.from.name || oldMailJson.from.email} <${oldMailJson.from.email}>`,
					to: `${oldMailJson.to.name || oldMailJson.to.email} <${oldMailJson.to.email}>`,
					sentToAddressId: address.id,
					inReplyTo: oldMail.in_reply_to || undefined,
					read: Boolean(oldMail.isread),
					trash: Boolean(oldMail.trash),
					archived: Boolean(oldMail.archived),
					dateReceived: new Date(Number(oldMail.date)),
					dateSent: new Date(Number(oldMail.date)),
					messageId: oldMail.message_id
				})

				const savedMail = await newMail.save()
				if (!savedMail) return console.error('Failed to save Mail', oldMail, newMail, savedMail)

				const attachments = []
				oldMailJson.attachments.forEach((oldAttachment) => {
					const oldAttachmentPath = nodePath.normalize(oldAttachment.path)
					if (!fs.existsSync(oldAttachmentPath)) return console.error('Failed to find attachment path for oldMailId:', oldMail.id, 'attachmentId:', oldAttachment.id)
					const oldAttachmentContent = fs.readFileSync(oldAttachmentPath)

					const attachmentId = randomToken(24)
					const attachmentPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/attachments/${attachmentId}-${oldAttachment.filename}`)
					fs.writeFileSync(attachmentPath, oldAttachmentContent)
					const attachment: Noonly.API.Data.MailAttachment = {
						filename: oldAttachment.filename,
						cid: oldAttachment.cid || undefined,
						related: oldAttachment.related || undefined,
						path: attachmentPath.split('\\').join('/'),
						id: attachmentId
					}
					attachments.push(attachment)
				})

				const mailPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/json/${savedMail.id}.json`)
				const mailData = {
					attachments: attachments,
					html: oldMailJson.html,
					text: oldMailJson.text
				}
				fs.writeFileSync(mailPath, JSON.stringify(mailData, null, 2))

				const oldEmlPath = nodePath.normalize(`D:/data2/mail/eml/${oldMail.id}.eml`)
				if (!fs.existsSync(oldEmlPath)) return console.error('Failed to find eml path for oldMailId:', oldMail.id)
				const emlPath = nodePath.normalize(`${process.env.DATA_DIR}/mail/eml/${newMail.id}.eml`)
				fs.copyFileSync(oldEmlPath, emlPath)
			})
		})
	}

	convertScreenshotFile(image) {
		image.ext = nodePath.extname(image.path).slice(1).toLowerCase()
		if (image.ext === 'jpeg') image.ext = 'jpg'
		if (!['jpg', 'png', 'webp', 'avif', 'gif', 'svg', 'tiff'].includes(image.ext))
			return
		if (['jpg', 'gif'].includes(image.ext))
			this.saveImage(image)
		else
			this.convertImage(image)
	}

	async convertImage(image) {
		const newPath = nodePath.normalize(`${image.path}.jpg`)
		await sharp(image.path)
			.jpeg({ quality: 100 })
			.toFile(newPath)
		// fs.rmSync(image.path)
		image.path = newPath
		image.ext = 'jpg'
		this.saveImage(image)
	}

	async saveImage(image) {
		image.name = randomToken(10)
		const newScreenshot = new ScreenshotModel({
			ownerId: image.userId,
			name: image.name,
			type: image.ext,
			size: fs.statSync(image.path).size,
			favorite: image.favorite,
			trash: image.trash,
			createdAt: image.createdAt,
			updatedAt: image.updatedAt
		})

		const savedScreenshot = await newScreenshot.save({ timestamps: false })
		if (!savedScreenshot) console.error('Failed to save Screenshot', image, newScreenshot, savedScreenshot)

		const imagePath = nodePath.normalize(`${process.env.DATA_DIR}/img/${image.name}.${image.ext}`)
		/* Don't worry, this moves the NEWLY created File! The original File is not affected by this. */
		mv(image.path, imagePath, () => {
			image.path = imagePath
			this.generatePreviewImage(image)
		})
	}

	async generatePreviewImage(image) {
		const previewImagePath = nodePath.normalize(`${process.env.DATA_DIR}/img/previews/preview_${image.name}.webp`)
		await sharp(image.path)
			.resize(300, 200, {
				kernel: sharp.kernel.nearest,
				fit: 'cover'
			})
			.webp({ nearLossless: true })
			.toFile(previewImagePath)
	}

	convertScreenshots(userMap) {
		Object.keys(userMap).forEach(async (oldUserId) => {
			const newUser = userMap[oldUserId]
			const oldScreenshots = await this.con.query('SELECT * FROM screenshots WHERE user_id = ?', [oldUserId])

			oldScreenshots.forEach((oldScreenshot) => {
				const oldScreenshotPath = nodePath.normalize(`C:/Aspire/www/noonly.net/ss/${newUser.username}/${oldScreenshot.name}`)
				if (!fs.existsSync(oldScreenshotPath)) return
				this.convertScreenshotFile({
					userId: newUser._id,
					name: oldScreenshot.name,
					path: oldScreenshotPath,
					trash: Boolean(oldScreenshot.trash),
					favorite: Boolean(oldScreenshot.favorite),
					createdAt: new Date(Number(oldScreenshot.createdAt)),
					updatedAt: new Date(Number(oldScreenshot.createdAt))
				})
			})
		})
	}

	convertAccounts(userMap) {
		Object.keys(userMap).forEach(async (oldUserId) => {
			const newUser = userMap[oldUserId]
			const oldAccounts = await this.con.query('SELECT * FROM passwords WHERE user_id = ?', [oldUserId])

			oldAccounts.forEach(async (oldAccount) => {
				const newAccount = new AccountModel({
					ownerId: newUser._id,
					site: oldAccount.site,
					username: oldAccount.username ||  '',
					address: oldAccount.email || '',
					password: oldAccount.password,
					trash: Boolean(oldAccount.trash),
					note: oldAccount.note || '',
					createdAt: new Date(Number(oldAccount.createdAt)),
					updatedAt: new Date(Number(oldAccount.modifiedAt))
				})

				const savedAccount = await newAccount.save({ timestamps: false })
				if (!savedAccount) console.error('Failed to save Account', oldAccount, newAccount, savedAccount)
			})
		})
	}

	convertUsers() {
		return new Promise(async (resolve) => {
			const users = await this.con.query('SELECT * FROM users')
			const userMap = {}

			let converted = 0
			users.forEach(async (oldUser) => {
				const newAddresses = await this.convertAddresses(oldUser.id)

				const newUser = new UserModel({
					username: oldUser.username,
					usernameLowercase: oldUser.username.toLowerCase(),
					password: oldUser.password,
					level: 0,
					imgToken: randomToken(10),
					cloudToken: randomToken(10),
					addresses: newAddresses.map((address) => address._id)
				})

				const savedUser = await newUser.save()
				if (!savedUser) console.error('Failed to save User', oldUser, newUser, savedUser)
				userMap[oldUser.id] = savedUser

				newAddresses.forEach(async (newAddress) => {
					const address = await AddressModel.findOne({ _id: newAddress._id })
					await AddressModel.updateOne({ _id: address._id }, { ownerId: savedUser._id }, { useFindAndModify: false })
				})

				converted += 1
				if (converted === users.length)
					resolve(userMap)
			})
		})
	}

	convertAddresses(oldUserId): Promise<AddressDocument[]> {
		return new Promise(async (resolve) => {
			const mailAccounts = await this.con.query('SELECT * FROM mail_accounts WHERE user_id = ?', [oldUserId])
			const newAddresses = []

			mailAccounts.forEach(async (mailAccount, index) => {
				/* Set owner after creation */
				const newAddress = new AddressModel({
					address: mailAccount.address.split('@')[0],
					addressLowercase: mailAccount.address.split('@')[0].toLowerCase(),
					name: mailAccount.address.split('@')[0],
					order: mailAccount.order_index,
					visible: Boolean(mailAccount.visible)
				})

				const savedAddress = await newAddress.save()
				if (!savedAddress) console.error('Failed to save User', mailAccount, newAddress, savedAddress)
				newAddresses.push(savedAddress)

				if (index === mailAccounts.length - 1)
					resolve(newAddresses)
			})
		})
	}
}