function humanFileSize(bytes, dp = 1) {
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
}

export default humanFileSize