const sharp = require('sharp')
const fs = require('fs')
const nodePath = require('path')

const track = []

const generateImages = async (path) => {
	const startTime = Date.now()
	const origName = nodePath.basename(path)
	const fileExt = nodePath.extname(path)

	const originalPath = `./output/${origName}-original.${nodePath.extname(path).slice(1)}`
	const compressedPath = `./output/${origName}-compressed.webp`
	const previewPath = `./output/${origName}-preview.webp`

	fs.copyFileSync(path, originalPath)

	const isAnimated = ['.gif', '.webm'].includes(fileExt)
	const compressed = sharp(path, { animated: isAnimated, pages: -1, limitInputPixels: false })
		.webp({ quality: 40 })
		.toFile(compressedPath)

	const preview = sharp(path)
		.resize(300, 200, {
			kernel: sharp.kernel.nearest,
			fit: 'cover'
		})
		.webp({ quality: 40 })
		.toFile(previewPath)
		
	await Promise.all([compressed, preview])

	const endTime = Date.now()
	const time = (endTime - startTime) / 1000

	const originalFileSize = fs.statSync(originalPath).size
	const compressedFileSize = fs.statSync(compressedPath).size
	const thumbnailFileSize = fs.statSync(previewPath).size

	const compressionPercent = 100 - (compressedFileSize / originalFileSize * 100)
	track.push({
		originalFileSize,
		compressedFileSize,
		thumbnailFileSize,
		compressionPercent,
		time
	})
}

const files = fs.readdirSync('./input')
fs.rmdirSync('./output', { recursive: true })
fs.mkdirSync('./output')
let converted = 0
const startTime = Date.now()
files.forEach(async (file) => {
	await generateImages(`./input/${file}`)
	converted++

	if (converted === files.length) {
		const endTime = Date.now()
		const timeTaken = (endTime - startTime) / 1000

		const averagePercentage = track.reduce((acc, e) => acc += e.compressionPercent, 0) / track.length
		const averageCompressedSize = track.reduce((acc, e) => acc += e.compressedFileSize / 1024, 0) / track.length
		const averagePreviewSize = track.reduce((acc, e) => acc += e.thumbnailFileSize / 1024, 0) / track.length
		const averageTime = track.reduce((acc, e) => acc += e.time, 0) / track.length

		console.log(`
-------------------------------
Time taken: ${Math.round(timeTaken)}s

Average compression: ${Math.round(averagePercentage)}%
Average compressed size: ${Math.round(averageCompressedSize)}KB
Average preview size: ${Math.round(averagePreviewSize)}KB
Average compression time: ${Math.round(averageTime)}s
^ Can only be trusted with smaller datasets
-------------------------------
		`)
	}
})