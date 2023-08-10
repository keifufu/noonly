const express = require('express')
const app = express()
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')

const cachedAuth = fs.readFileSync(`${__dirname}/../__auth`).toString()
function checkPassword(password) {
  if (!password || !cachedAuth) return false
  const [storedHashedPassword, salt, iterations, keylen] = cachedAuth.split(':')
  const hashedPassword = crypto.pbkdf2Sync(password, salt, parseInt(iterations), parseInt(keylen), 'sha512').toString('hex')
  return hashedPassword === storedHashedPassword
}

app.get('/backup.zip', (req, res) => {
  if (checkPassword(req.query.password)) {
    if (fs.existsSync(`${__dirname}/../__inprogress`))
      return res.status(503).send('Backup is not ready yet')
    if (fs.existsSync(`${__dirname}/../backup.zip`))
      res.sendFile(path.join(__dirname, '../backup.zip'))
    else
      res.status(404).send('The file does not exist')
  } else {
    res.status(401).send('Incorrect password')
  }
})

app.listen(3333, () => {
  console.log('Listening on port: 3333')
})