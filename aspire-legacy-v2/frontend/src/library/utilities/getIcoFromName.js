function getIcoFromName(name) {
	if (!name) return `https://${process.env.REACT_APP_HOSTNAME}/ico/_file.ico`
	// eslint-disable-next-line max-len
	const icons = ['AHK', 'CSS', 'GIF', 'HTML', 'INI', 'JAR', 'JFIF', 'JPEG', 'JPG', 'JS', 'JSON', 'MP3', 'PDF', 'PNG', 'RAR', 'TS', 'TXT', 'XML', 'ZIP']
	const fileExtension = name.split('.')[name.split('.').length - 1].toUpperCase()
	const icon = icons.includes(fileExtension) ? fileExtension : '_file'
	const iconURL = `https://${process.env.REACT_APP_HOSTNAME}/ico/${icon}.ico`
	return iconURL
}

export default getIcoFromName