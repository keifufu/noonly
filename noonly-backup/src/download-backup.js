const process = require('process')
const https = require('https')
const fs = require('fs')

const pass = fs.readFileSync('./__auth').toString()

const path = `D:/backups/`
if (!fs.existsSync(path)) fs.mkdirSync(path)
const date = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')
const filePath = `${path}${date}.zip`
https.get(`https://backup.noonly.net/backup.zip?password=${pass}`, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Error downloading backup: ${res.statusCode}`)
    return
  }

  const writeStream = fs.createWriteStream(filePath)
  res.pipe(writeStream)
  
  writeStream.on('finish', () => {
    writeStream.close()
    console.log(`Backup downloaded to ${filePath}`)
  })
}).on('error', () => {
  console.error('Error downloading backup')
  fs.rmSync(filePath)
})

// We are lazy and use pm2 to run create-backup and download-backup.
// pm2 exists to keep applications running... so when this exits, it will restart it.
// So we simply download one backup, then idle this script forever until pm2 cron restarts it.
process.stdin.resume()