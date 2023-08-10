const Crypto = {
  async deriveKey(passphrase, iterations, salt) {
    return crypto.subtle
      .importKey('raw', Crypto.utils.str2buf(passphrase), 'PBKDF2', false, ['deriveKey'])
      .then((key) =>
        crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
          key,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        ),
      )
      .then((key) => key)
  },
  async exportKey(key) {
    return crypto.subtle.exportKey('jwk', key).then((key) => JSON.stringify(key))
  },
  async importKey(key) {
    return crypto.subtle.importKey('jwk', JSON.parse(key), 'AES-GCM', true, ['encrypt', 'decrypt'])
  },
  async encrypt(plaintext, _key) {
    const key = _key || await Crypto.keyStore.getKey()
    if (!key) throw new Error('No key found')
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const data = Crypto.utils.str2buf(plaintext)
    return crypto.subtle
      .encrypt({ name: 'AES-GCM', iv }, key, data)
      .then((ciphertext) => `${Crypto.utils.buf2hex(iv)}-${Crypto.utils.buf2hex(ciphertext)}`)
  },
  async decrypt(saltIvItCipherHex, _key) {
    const key = _key || await Crypto.keyStore.getKey()
    if (!key) throw new Error('No key found')
    const split = saltIvItCipherHex.split('-')
    const iv = Crypto.utils.hex2buf(split[0])
    const ciphertext = Crypto.utils.hex2buf(split[1])
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext).then((v) => Crypto.utils.buf2str(new Uint8Array(v)))
  },
  async sha256(str) {
    return crypto.subtle.digest('SHA-256', Crypto.utils.str2buf(str)).then((hash) => Crypto.utils.buf2hex(hash))
  },
  utils: {
    /*
     * Encodes a utf8 string as a byte array.
     */
    str2buf(str) {
      return new TextEncoder().encode(str)
    },
    /*
     * Decodes a byte array as a utf8 string.
     */
    buf2str(buffer) {
      return new TextDecoder('utf-8').decode(buffer)
    },
    /*
     * Decodes a string of hex to a byte array.
     */
    hex2buf(hexStr) {
      return new Uint8Array(hexStr.match(/.{2}/g)?.map(h => parseInt(h, 16)) || [])
    },
    /*
     * Encodes a byte array as a string of hex.
     */
    buf2hex(buffer) {
      return Array.prototype.slice
        .call(new Uint8Array(buffer))
        .map(x => [x >> 4, x & 15])
        .map(ab => ab.map(x => x.toString(16)).join(''))
        .join('')
    }
  },
  keyStore: {
    cachedKey: undefined,
    async getKey() {
      if (Crypto.keyStore.cachedKey) return Crypto.keyStore.cachedKey
      const encKeyStr = localStorage.getItem('encKeyStr')
      if (!encKeyStr) return undefined
      const key = await Crypto.importKey(encKeyStr)
      Crypto.keyStore.cachedKey = key
      return key
    },
    async setKey(key) {
      Crypto.keyStore.cachedKey = key
      const encKeyStr = await Crypto.exportKey(key)
      localStorage.setItem('encKeyStr', encKeyStr)
    }
  }
}


async function login(username, password) {
  const loginDataForServer = {
    username,
    password: Crypto.sha256(password)
  }

  const responseFromServer = {
    encKeyStr_e: '3969bb40ed5f8754873d885c-38ac54a7b7dfae0825e2768c8ac8ac92212f2e1d2d26861eb594b573bc9a5f64f9aef008ff95eb9e2cb242c51a6e42ffa60274ef2e3c54e3863df49c2d084ee5ddeaf6667dd5dbe7fee08131f966f99835013ee8a7342bc6daccb25c4ddf3c5584bd60b5fa12fdd131e4b04085f2c6106f8939da0dbdd41c6561a5d5dd1d957ccad7183c6004ec5fb7af'
  }

  const masterKey = await Crypto.deriveKey(password, 10_000_000, Crypto.utils.str2buf(username))
  const encKeyStr = await Crypto.decrypt(responseFromServer.encKeyStr_e, masterKey)
  const encKey = await Crypto.importKey(encKeyStr)
  await Crypto.keyStore.setKey(encKey)
}

function randomToken(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (var i = 0, n = charset.length, token = ''; i < length; ++i) {
    token += charset.charAt(Math.floor(Math.random() * n))
  }
  return token
}

async function register(username, password) {
  const masterKey = await Crypto.deriveKey(password, 10_000_000, Crypto.utils.str2buf(username))
  const encKey = await Crypto.deriveKey(randomToken(256), 10_000_000, Crypto.utils.str2buf(username))
  const encKeyStr = await Crypto.exportKey(encKey)
  const encKeyStr_e = await Crypto.encrypt(encKeyStr, masterKey)

  const dataForServer = {
    username,
    password: Crypto.sha256(password),
    encKeyStr_e
  }

  await Crypto.keyStore.setKey(encKey)
}

const main = async () => {
  const password = 'this is a password'
  const username = 'keifufu'

  document.getElementById('version').innerHTML = `v1.2`

  const webcryptoSupported = !!crypto.subtle
  document.getElementById('webcrypto').innerHTML = `WebCrypto supported: ${webcryptoSupported}`

  document.getElementById('login').innerHTML = 'Loading...'
  document.getElementById('data').innerHTML = 'Loading...'
  document.getElementById('encrypt').innerHTML = 'Loading...'
  document.getElementById('decrypt').innerHTML = 'Loading...'

  var loginStart = window.performance.now()
  await register(username, password)
  // await login(username, password)
  var loginEnd = window.performance.now()
  document.getElementById('login').innerHTML = `Login: ${Math.round(loginEnd - loginStart)} ms`

  var dataStart = window.performance.now()
  const encrypt = []
  for (let i = 0; i < 5000; i++) {
    const data = {
      username: randomToken(24),
      password: randomToken(24),
      email: randomToken(24),
      website: randomToken(24),
      notes: randomToken(1024),
      var1: true,
      var2: false,
      var3: 123,
      var4: 123.456,
      var5: null,
      var6: undefined,
    }
    encrypt.push(JSON.stringify(data))
  }
  var dataEnd = window.performance.now()
  document.getElementById('data').innerHTML = `Data: ${Math.round(dataEnd - dataStart)} ms`

  const data = []
  var encryptStart = window.performance.now()
  for (let i = 0; i < 1000; i++) {
    data.push(await Crypto.encrypt(encrypt[i]))
  }
  var encryptEnd = window.performance.now()
  document.getElementById('encrypt').innerHTML = `Encrypt: ${Math.round(encryptEnd - encryptStart)} ms`

  var decryptStart = window.performance.now()
  for (let i = 0; i < 1000; i++) {
    const decryptedData = await Crypto.decrypt(data[i])
  }
  var decryptEnd = window.performance.now()
  document.getElementById('decrypt').innerHTML = `Decrypt: ${Math.round(decryptEnd - decryptStart)} ms`
}

main()