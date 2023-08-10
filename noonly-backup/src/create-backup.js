const { execSync } = require('child_process')
const fs = require('fs')

const DATA_PATH = '/noonly/data'
const BACKUP_PATH = `${__dirname}/../backup`
const ZIP_PATH = `${__dirname}/../backup.zip`
const INPROGRESS_PATH = `${__dirname}/../__inprogress`

fs.writeFileSync(INPROGRESS_PATH, 'true')

try {
  // Remove leftover of old in-progress backup if any
  if (fs.existsSync(BACKUP_PATH))
    fs.rmdirSync(BACKUP_PATH, { recursive: true })
  fs.mkdirSync(BACKUP_PATH)
  
  // Remove old backup.zip
  if (fs.existsSync(ZIP_PATH))
    fs.rmSync(ZIP_PATH, { force: true })
  
  // Dump MongoDB
  execSync(`mongodump --db noonly --out ${BACKUP_PATH}/mongodump`, { stdio: 'ignore' })
  // Copy noonly data
  execSync(`cp -r ${DATA_PATH} ${BACKUP_PATH}/data`, { stdio: 'ignore' })
  // Zip backup
  execSync(`cd ${__dirname}/../ && zip -r ${ZIP_PATH} backup`, { stdio: 'ignore' })
  // Remove temporary backup folder
  execSync(`rm -r ${BACKUP_PATH}`, { stdio: 'ignore' })
  fs.rmSync(INPROGRESS_PATH, { force: true })
} catch {
  // Remove backup.zip and temporary backup folder if any
  fs.rmSync(ZIP_PATH, { force: true })
  if (fs.existsSync(BACKUP_PATH))
    fs.rmdirSync(BACKUP_PATH, { recursive: true })
  fs.rmSync(INPROGRESS_PATH, { force: true })
}

// We are lazy and use pm2 to run create-backup and download-backup.
// pm2 exists to keep applications running... so when this exits, it will restart it.
// So we simply download one backup, then idle this script forever until pm2 cron restarts it.
process.stdin.resume()