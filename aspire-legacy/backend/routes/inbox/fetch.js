const simpleParser = require('mailparser').simpleParser
const { generateToken } = require('../../Utilities')
const nodePath = require('path')
const fs = require('fs')
let added = []
module.exports = {
	route: '/inbox/fetch',
	middleware: false,
	type: 'post',
	execute: async (req, res, con) => {
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
		if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

		/* Search and parse new emails */
		const inboxDir = nodePath.normalize(process.env.INBOX_DIR)
		readRecursive(inboxDir, con)

		const mailRows = await con.query(`SELECT * FROM mail_accounts WHERE account_username = '${userRow.username}'`)
		const mail = await con.query(`SELECT * FROM mail`)
		let result = {}
		mailRows.forEach(row => {
			let userMail = []
			mail.filter(e => e.to_address.toLowerCase() === row.address.toLowerCase() || e.from_address.toLowerCase() === row.address.toLowerCase() || e.forwarded_to.toLowerCase() === row.address.toLowerCase()).forEach(e => {
				const mail = JSON.parse(fs.readFileSync(nodePath.normalize(e.path)))
				mail.aspire_id = e.aspire_id
				mail.favorite = e.favorite === 'true'
				mail.location = e.location
				mail.read = e.isread === 'true'
				mail.sent = mail.from_address === e.address
				userMail.push(mail)
			})
			userMail.sort((a, b) => Date.parse(a.date) / 1000 - Date.parse(b.date) / 1000)
	
			let sortedMail = []
			added = []
			userMail.forEach(mail => {
				if(mail.inReplyTo) sortedMail = findMail(sortedMail, mail)
				else {
					sortedMail.push(mail)
					added.push(mail)
				}
			})
			userMail.forEach(mail => {
				if(!added.find(e => e.messageId === mail.messageId)) sortedMail.push(mail)
			})
			result[row.address.toLowerCase()] = sortedMail
		})
		res.send({ res: true, payload: result })
	}
}

function findMail(arr, mail) {
	let found = null
	arr.forEach(e => {
		if(e.messageId === mail.inReplyTo) found = e
		if(e.replies) {
			const res = findMail(e.replies, mail)
			e.replies = res
		}
	})
	if(found) {
		if(!Array.isArray(found.replies)) found.replies = []
		found.replies.push(mail)
		added.push(mail)
	}
	return arr
}

function readRecursive(dir, ...args) {
	dir = nodePath.normalize(dir)
	const files = fs.readdirSync(dir)
	files.forEach(file => {
		const path = nodePath.normalize(`${dir}/${file}`)
		const ext = nodePath.extname(file)
		if(fs.statSync(path).isDirectory()) readRecursive(path, ...args)
		else if(ext === '.eml') processEml(path, ...args)
	})
}

function processEml(path, con) {
	const eml = fs.readFileSync(path, 'utf-8')
	simpleParser(eml, { skipImageLinks: true }).then(async data => {
		try {
			const [row] = await con.query(`SELECT * FROM mail WHERE originalPath = '${path.split('\\').join('/')}'`)
			if(row) return
			const filename = generateToken(24)
			const attachments = []
			data.attachments.forEach(e => {
				const attachmentName = generateToken(24)
				const path = nodePath.normalize(`${process.env.NODE_DIR}/data/mail/attachments/${attachmentName}-${e.filename}`)
				fs.writeFileSync(path, Buffer.from(e.content))
				delete e.content
				e.path = path.split('\\').join('/')
				attachments.push(e)
			})
			data.attachments = attachments
			let forwarded_to = ''
			const _forwarded_to = data.headerLines.find(e => e.key === 'x-forwarded-to')
			if(_forwarded_to) forwarded_to = _forwarded_to.line.replace('X-Forwarded-To: ', '')
			const mailPath = nodePath.normalize(`${process.env.NODE_DIR}/data/mail/${filename}.json`)
			await con.query(`INSERT INTO mail (aspire_id, from_address, to_address, forwarded_to, isread, favorite, location, path, originalPath) VALUES ('${filename}', '${data.from.value[0].address}', '${data.to.value[0].address}', '${forwarded_to}', 'false', 'false', 'inbox', '${mailPath.split('\\').join('/')}', '${path.split('\\').join('/')}')`)
			fs.writeFileSync(mailPath, JSON.stringify(data, null, 2))
		} catch(e) { console.log(e) }
	}).catch(console.log)
}