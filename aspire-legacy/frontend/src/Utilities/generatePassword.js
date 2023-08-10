function generatePassword(length, options = { uppercase: true, lowercase: true, numbers: true, symbols: true }) {
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

export default generatePassword