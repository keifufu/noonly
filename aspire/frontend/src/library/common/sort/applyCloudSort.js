function applyCloudSort(cloud, sort) {
	let returnValue = []
	if (sort.by === 'Name') {
		if (sort.direction === 'Down')
			returnValue = cloud.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
		else if (sort.direction === 'Up')
			returnValue = cloud.sort((a, b) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0))
	} else if (sort.by === 'Last Modified') {
		if (sort.direction === 'Down')
			returnValue = cloud.sort((a, b) => new Date(parseInt(b.modifiedAt)) - new Date(parseInt(a.modifiedAt)))
		else if (sort.direction === 'Up')
			returnValue = cloud.sort((a, b) => new Date(parseInt(a.modifiedAt)) - new Date(parseInt(b.modifiedAt)))
	}

	return returnValue
}

export default applyCloudSort