import CryptoJS from 'crypto-js'
import decrypt from 'library/utilities/decrypt'
import storage from 'library/utilities/storage'
import store from 'main/store'

const encrypt = (message: string, key?: string): string => {
	if (!message) return ''
	let encryptKey = key
	if (!encryptKey) {
		const state = store.getState()
		if (!state.user.username) return ''
		encryptKey = decrypt(storage.getItem('encrypted_password', true), state.user.username.toLowerCase())
	}
	const keyHex = CryptoJS.enc.Utf8.parse(encryptKey)
	const encrypted = CryptoJS.DES.encrypt(message, keyHex, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	return encrypted.toString()
}

export default encrypt