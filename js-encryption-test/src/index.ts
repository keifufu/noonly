import fs from 'fs'
import Crypto from './crypto'
import { login } from './examples/login'
import { register } from './examples/register'
import randomToken from './randomToken'

const main = async () => {
  const password = 'this is a password'
  const username = 'keifufu'

  console.time('login')
  // await register(username, password)
  await login(username, password)
  console.timeEnd('login')

  console.time('random token')
  const encrypt = []
  for (let i = 0; i < 1000; i++) {
    const data = {
      username: randomToken(24),
      password: randomToken(24),
      email: randomToken(24),
      website: randomToken(24),
      notes: randomToken(1024),
    }
    encrypt.push(JSON.stringify(data))
    // encrypt.push(randomToken(24))
  }
  console.timeEnd('random token')

  const data = []
  console.time('encrypt')
  for (let i = 0; i < 1000; i++) {
    data.push(await Crypto.encrypt(encrypt[i]))
  }
  console.log((await Crypto.encrypt(encrypt[1])).length)
  console.timeEnd('encrypt')
  // fs.writeFileSync('data.json', JSON.stringify(data, null, 2))

  // const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'))
  console.time('decrypt')
  for (let i = 0; i < 1000; i++) {
    const decryptedData = await Crypto.decrypt(data[i])
  }
  console.timeEnd('decrypt')
}

main()