import CryptoJS from 'crypto-js'
import SyncStorage from 'sync-storage'

const decrypt = (ciphertext: string, key?: string): Promise<string> => new Promise(async (resolve, reject) => {
	if (!ciphertext) return reject('No ciphertext was provided')

	let decryptKey = key
	if (!decryptKey) {
		const username = SyncStorage.get('__username')
		if (!username) return reject('No key was provided')
		const encryptedPassword = SyncStorage.get('__encryptedPassword')
		try {
			decryptKey = await decrypt(encryptedPassword, username.toLowerCase())
		} catch (error) {
			return reject(error)
		}
	}
	if (!decryptKey) return reject('No key was provided')

	const hexKey = CryptoJS.enc.Utf8.parse(decryptKey)
	const code = CryptoJS.DES.decrypt(ciphertext, hexKey, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	const decryptedMessage = code.toString(CryptoJS.enc.Utf8)
	if (!decryptedMessage || decryptedMessage.length === 0)
		return reject('Failed decryption')
	return resolve(decryptedMessage)
})

export default decrypt