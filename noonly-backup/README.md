# Noonly Backup
A collection of scripts to be run by 
  - The noonly server
  - A backup server
to backup noonly-related data to another server.

## Requirements
- Node.js
- npm
- pm2

# Running
## Noonly Server
- `cd /noonly`
- `git clone git@github.com:noonly-net/noonly-backup.git && cd noonly-backup && npm i && apt install -y zip`
- `npm run pass server <PASSWORD>`
- `pm2 start src/create-backup.js --name noonly-backup-create --cron "0 12 * * *" && pm2 start src/server.js --name noonly-backup-server && pm2 save`

## Backup Server
- `git clone git@github.com:noonly-net/noonly-backup.git ; cd noonly-backup ; npm i`
- `npm run pass backup <PASSWORD>`
- `pm2 start src/download-backup.js --name noonly-backup-download --cron "0 0 * * *" ; pm2 save`
