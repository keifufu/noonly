import Crypto from "../crypto"

export async function login(username: string, password: string) {
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