import CryptoJS from 'crypto-js'
import SyncStorage from 'sync-storage'
import decrypt from './decrypt'

const encrypt = (message: string, key?: string): Promise<string> => new Promise(async (resolve, reject) => {
	if (!message) return reject('No message was provided')

	let encryptKey = key
	if (!encryptKey) {
		const username = SyncStorage.get('__username')
		if (!username) return reject('No key was provided')
		const encryptedPassword = SyncStorage.get('__encryptedPassword')
		try {
			encryptKey = await decrypt(encryptedPassword, username.toLowerCase())
		} catch (error) {
			return reject(error)
		}
	}
	if (!encryptKey) return reject('No key was provided')

	const hexKey = CryptoJS.enc.Utf8.parse(encryptKey)
	const encryptedMessage = CryptoJS.DES.encrypt(message, hexKey, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	}).toString()
	if (!encryptedMessage || encryptedMessage.length === 0)
		return reject('Failed encryption')
	return resolve(encryptedMessage)
})

export default encrypt