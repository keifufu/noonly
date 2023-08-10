import crypto from 'node:crypto'
import localStorage from './localStorage'

const Crypto = {
  async deriveKey(passphrase: string, iterations: number, salt: Uint8Array): Promise<CryptoKey> {
    return crypto.webcrypto.subtle
      .importKey('raw', Crypto.utils.str2buf(passphrase), 'PBKDF2', false, ['deriveKey'])
      .then((key) =>
        crypto.webcrypto.subtle.deriveKey(
          { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
          key,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        ),
      )
      .then((key) => key)
  },
  async exportKey(key: CryptoKey): Promise<string> {
    return crypto.webcrypto.subtle.exportKey('jwk', key).then((key) => JSON.stringify(key))
  },
  async importKey(key: string): Promise<CryptoKey> {
    return crypto.webcrypto.subtle.importKey('jwk', JSON.parse(key), 'AES-GCM', true, ['encrypt', 'decrypt'])
  },
  async encrypt(plaintext: string, _key?: CryptoKey): Promise<string> {
    const key = _key || await Crypto.keyStore.getKey()
    if (!key) throw new Error('No key found')
    const iv = crypto.webcrypto.getRandomValues(new Uint8Array(12))
    const data = Crypto.utils.str2buf(plaintext)
    return crypto.webcrypto.subtle
      .encrypt({ name: 'AES-GCM', iv }, key, data)
      .then((ciphertext) => `${Crypto.utils.buf2hex(iv)}-${Crypto.utils.buf2hex(ciphertext)}`)
  },
  async decrypt(saltIvItCipherHex: string, _key?: CryptoKey): Promise<string> {
    const key = _key || await Crypto.keyStore.getKey()
    if (!key) throw new Error('No key found')
    const split = saltIvItCipherHex.split('-')
    const iv = Crypto.utils.hex2buf(split[0])
    const ciphertext = Crypto.utils.hex2buf(split[1])
    return crypto.webcrypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext).then((v) => Crypto.utils.buf2str(new Uint8Array(v)))
  },
  async sha256(str: string): Promise<string> {
    return crypto.webcrypto.subtle.digest('SHA-256', Crypto.utils.str2buf(str)).then((hash) => Crypto.utils.buf2hex(hash))
  },
  utils: {
    /*
     * Encodes a utf8 string as a byte array.
     */
    str2buf(str: string): Uint8Array {
      return new TextEncoder().encode(str)
    },
    /*
     * Decodes a byte array as a utf8 string.
     */
    buf2str(buffer: Uint8Array): string {
      return new TextDecoder('utf-8').decode(buffer)
    },
    /*
     * Decodes a string of hex to a byte array.
     */
    hex2buf(hexStr: string): Uint8Array {
      return new Uint8Array(hexStr.match(/.{2}/g)?.map(h => parseInt(h, 16)) || [])
    },
    /*
     * Encodes a byte array as a string of hex.
     */
    buf2hex(buffer: Uint8Array | ArrayBuffer): string {
      return Array.prototype.slice
        .call(new Uint8Array(buffer))
        .map(x => [x >> 4, x & 15])
        .map(ab => ab.map(x => x.toString(16)).join(''))
        .join('')
    }
  },
  keyStore: {
    cachedKey: undefined as any,
    async getKey(): Promise<CryptoKey | undefined> {
      if (Crypto.keyStore.cachedKey) return Crypto.keyStore.cachedKey
      const encKeyStr = localStorage.getItem('encKeyStr')
      if (!encKeyStr) return undefined
      const key = await Crypto.importKey(encKeyStr)
      Crypto.keyStore.cachedKey = key
      return key
    },
    async setKey(key: CryptoKey): Promise<void> {
      Crypto.keyStore.cachedKey = key
      const encKeyStr = await Crypto.exportKey(key)
      localStorage.setItem('encKeyStr', encKeyStr)
    }
  }
}

export default Crypto