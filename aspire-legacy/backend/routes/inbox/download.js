const { generateToken } = require('../../Utilities')
const archiver = require('archiver')
const nodePath = require('path')
const fs = require('fs')
module.exports = {
	route: '/inbox/download',
	middleware: false,
	type: 'get',
	execute: async (req, res, con) => {
		const { items: _items } = req.query
		const [userRow] = await con.query(`SELECT * FROM users WHERE token = '${req.headers.token}'`)
        if(!userRow) return res.send({ res: false, payload: 'Something went wrong' })

        const items = JSON.parse(_items)
        if(!Array.isArray(items)) return res.send({ res: false, payload: 'Something went wrong' })
        const doStuff = new Promise(resolve => {
            const paths = []
            items.forEach(async (item, index) => {
                const [mailRow] = await con.query(`SELECT * FROM mail WHERE aspire_id = '${item.aspire_id}'`)
                if(!mailRow) return res.send({ res: false, payload: 'Something went wrong' })
                const path = nodePath.normalize(mailRow.originalPath)
                if(fs.existsSync(path)) paths.push(path)
                if(index === items.length - 1) resolve(paths)
            })
        })
        doStuff.then(paths => {
            if(paths.length === 0) res.send({ res: false, payload: 'Something went wrong' })
            if(paths.length === 1) res.download(paths[0])
            else {
                const token = generateToken(24)
                const path = nodePath.normalize(`${process.env.NODE_DIR}/data/temp/userdl/${token}`)
                fs.mkdirSync(path)
                paths.forEach(_path => fs.copyFileSync(_path, `${path}/${nodePath.basename(_path)}`))
                const key = generateToken(24)
                const zipPath = nodePath.normalize(`${process.env.NODE_DIR}/data/temp/userdl/${key}.zip`)
                res.contentType(zipPath)
                zipDirectory(path, zipPath).then(() => {
                    res.download(zipPath, `${nodePath.basename(path)}.zip`)
                }).catch(() => res.send({ res: false, payload: 'Something went wrong' }))
            }
        }).catch(e => res.send({ res: false, payload: e }))
	}
}

function zipDirectory(source, out) {
	const archive = archiver('zip', { zLib: { level: 9 }})
	const stream = fs.createWriteStream(out)

	return new Promise((resolve, reject) => {
		archive.directory(source, false)
		.on('error', err => reject(err))
		.pipe(stream)

		stream.on('close', () => resolve())
		archive.finalize()
	})
}