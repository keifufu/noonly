import Crypto from "../crypto"
import randomToken from "../randomToken"

export async function register(username: string, password: string) {
  const masterKey = await Crypto.deriveKey(password, 10_000_000, Crypto.utils.str2buf(username))
  const encKey = await Crypto.deriveKey(randomToken(256), 10_000_000, Crypto.utils.str2buf(username))
  const encKeyStr = await Crypto.exportKey(encKey)
  const encKeyStr_e = await Crypto.encrypt(encKeyStr, masterKey)

  const dataForServer = {
    username,
    password: Crypto.sha256(password),
    encKeyStr_e
  }

  console.log(encKeyStr_e)
  await Crypto.keyStore.setKey(encKey)
}