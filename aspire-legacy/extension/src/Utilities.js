const CryptoJS = require('crypto-js')

module.exports = {
	getCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)===' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	},
	setCookie(name,value,minutes) {
		let expires;
		if (minutes) {
			var date = new Date();
			date.setTime(date.getTime()+(minutes*60*1000));
			expires = "; expires="+date.toGMTString();
		}
		else expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	},
	encrypt(message, key) {
		const keyHex = CryptoJS.enc.Utf8.parse(key)
		const encrypted = CryptoJS.DES.encrypt(message, keyHex, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7
		})
		return encrypted.toString()
	},
	decrypt(ciphertext, key) {
		const keyHex = CryptoJS.enc.Utf8.parse(key)
		const decrypted = CryptoJS.DES.decrypt({
			ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
		}, keyHex, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7
		})
		return decrypted.toString(CryptoJS.enc.Utf8)
	},
	getIcoFromName(name) {
		if(!name) return 'https://aspire.icu/ico/_file.ico'
		const icons = ['AHK', 'CSS', 'GIF', 'HTML', 'INI', 'JAR', 'JFIF', 'JPEG', 'JPG', 'JS', 'JSON', 'MP3', 'PDF', 'PNG', 'RAR', 'TS', 'TXT', 'XML', 'ZIP']
		const fileExtension = name.split('.')[name.split('.').length - 1].toUpperCase()
		const icon = icons.includes(fileExtension) ? fileExtension : '_file'
		const iconURL = `https://aspire.icu/ico/${icon}.ico`
		return iconURL
	},
	humanFileSize(bytes, dp=1) {
		const thresh = 1000
		if (Math.abs(bytes) < thresh) return bytes + ' B';
		const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		const r = 10 ** dp
		let u = -1
		do {
			bytes /= thresh
			++u
		} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)
		return bytes.toFixed(dp) + ' ' + units[u]
	},
	generatePassword(length, options = { uppercase: true, lowercase: true, numbers: true, symbols: true }) {
		let charset = ''
		if(options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		if(options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
		if(options.numbers) charset += '0123456789'
		if(options.symbols) charset += '!!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
		let password = ''
		for(let i = 0; i < length; i++) {
			password += charset[Math.floor(Math.random() * charset.length)]
		}
		return password
	}
}