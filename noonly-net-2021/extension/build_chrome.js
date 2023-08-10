/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const { execFile } = require('child_process')
const path = require('path')

const CHROME_DIR = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

if (!fs.existsSync(CHROME_DIR)) {
	console.error('Chrome not found')
	process.exit(1)
}

execFile(CHROME_DIR, [`--pack-extension=${path.resolve('./dist/build/chrome')}`], (error, stdout, stderr) => {
	if (error) {
		console.error(error)
		process.exit(1)
	}
	console.log(stdout)
	console.log(stderr)
})