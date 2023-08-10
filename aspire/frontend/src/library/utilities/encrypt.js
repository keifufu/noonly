import storage from 'library/utilities/storage'
import decrypt from 'library/utilities/decrypt'
import CryptoJS from 'crypto-js'

function encrypt(message, key) {
	if (!message) return ''
	const user = storage.getItem('user')
	const keyHex = CryptoJS.enc.Utf8.parse(key || decrypt(user.password, user.username))
	const encrypted = CryptoJS.DES.encrypt(message, keyHex, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	return encrypted.toString()
}

export default encrypt