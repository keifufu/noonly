import CryptoJS from 'crypto-js'
import storage from 'library/utilities/storage'
import store from 'main/store'

const decrypt = (ciphertext: string, key?: string): string => {
	if (!ciphertext) return ''
	let decryptKey = key
	if (!decryptKey) {
		const state = store.getState()
		if (!state.user?.username) return ''
		decryptKey = decrypt(storage.getItem('encrypted_password', true), state.user.username.toLowerCase())
	}
	const keyHex = CryptoJS.enc.Utf8.parse(decryptKey)
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const decrypted = CryptoJS.DES.decrypt({
		ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
	}, keyHex, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	return decrypted.toString(CryptoJS.enc.Utf8)
}

export default decrypt