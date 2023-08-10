function applyScreenshotSort(screenshots, sort) {
	let returnValue = []
	if (sort.by === 'Date') {
		if (sort.direction === 'Down')
			returnValue = screenshots.sort((a, b) => new Date(parseInt(b.createdAt)) - new Date(parseInt(a.createdAt)))
		else if (sort.direction === 'Up')
			returnValue = screenshots.sort((a, b) => new Date(parseInt(a.createdAt)) - new Date(parseInt(b.createdAt)))
	} else if (sort.by === 'Type') {
		if (sort.direction === 'Down')
			returnValue = screenshots.sort((a, b) => (a.type < b.type ? -1 : a.type > b.type ? 1 : 0))
		else if (sort.direction === 'Up')
			returnValue = screenshots.sort((a, b) => (a.type > b.type ? -1 : a.type < b.type ? 1 : 0))
	} else if (sort.by === 'Filesize') {
		if (sort.direction === 'Down')
			returnValue = screenshots.sort((a, b) => (parseInt(a.size) > parseInt(b.size) ? -1 : parseInt(a.size) < parseInt(b.size) ? 1 : 0))
		else if (sort.direction === 'Up')
			returnValue = screenshots.sort((a, b) => (parseInt(a.size) < parseInt(b.size) ? -1 : parseInt(a.size) > parseInt(b.size) ? 1 : 0))
	}

	return returnValue
}

export default applyScreenshotSort