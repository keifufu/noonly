import storage from 'library/utilities/storage'
import CryptoJS from 'crypto-js'

function decrypt(ciphertext, key) {
	if (!ciphertext) return ''
	const { user } = storage
	const keyHex = CryptoJS.enc.Utf8.parse(key || decrypt(user.password, user.username))
	const decrypted = CryptoJS.DES.decrypt({
		ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
	}, keyHex, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	return decrypted.toString(CryptoJS.enc.Utf8)
}

export default decrypt