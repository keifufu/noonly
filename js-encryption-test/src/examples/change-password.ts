import Crypto from "../crypto"

// This assumes you're already logged in
async function changePassword(oldPassword: string, newPassword: string, username: string) {
  const dataFromServer = {
    encKeyStr_e: 'encrypted json stringified jwk'
  }

  const oldMasterKey = await Crypto.deriveKey(oldPassword, 10_000_000, Crypto.utils.str2buf(username))
  const encKeyStr = await Crypto.decrypt(dataFromServer.encKeyStr_e, oldMasterKey)
  const masterKey = await Crypto.deriveKey(newPassword, 10_000_000, Crypto.utils.str2buf(username))
  const encKeyStr_e = await Crypto.encrypt(encKeyStr, masterKey)

  const dataForServer = {
    password: Crypto.sha256(newPassword),
    encKeyStr_e
  }
}