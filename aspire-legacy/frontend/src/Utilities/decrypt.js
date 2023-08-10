const CryptoJS = require('crypto-js')
function decrypt(ciphertext, key) {
    const keyHex = CryptoJS.enc.Utf8.parse(key)
    const decrypted = CryptoJS.DES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
    }, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    })
    return decrypted.toString(CryptoJS.enc.Utf8)
}

export default decrypt