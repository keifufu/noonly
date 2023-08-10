const fs = require('fs')
const crypto = require('crypto')

const location = process.argv[2]
const password = process.argv[3]

if (location.toLowerCase() === 'backup') {
  fs.writeFileSync('./__auth', password)
} else {
  const salt = crypto.randomBytes(16).toString('hex')
  const iterations = 1000000
  const keylen = 64
  const hashedPassword = crypto.pbkdf2Sync(password, salt, iterations, keylen, 'sha512').toString('hex')
  
  fs.writeFileSync('./__auth', `${hashedPassword}:${salt}:${iterations}:${keylen}`)
}