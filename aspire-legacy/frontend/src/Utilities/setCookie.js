function setCookie(name, value, minutes) {
    let expires
    if(minutes) {
        var date = new Date()
        date.setTime(date.getTime() + (minutes * 60 * 1000))
        expires = `; expires=${date.toGMTString()}`
    }
    else expires = ''
    document.cookie = `${name}=${value}${expires}; path=/`
}

export default setCookie