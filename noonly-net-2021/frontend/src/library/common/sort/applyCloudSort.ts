const applyCloudSort = (files: Noonly.API.Data.File[], sort: Noonly.State.SortValue): Noonly.API.Data.File[] => {
	let sortedFiles: Noonly.API.Data.File[] = []
	if (sort.method === 'Name') {
		if (sort.direction === 'down')
			sortedFiles = files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
		else if (sort.direction === 'up')
			sortedFiles = files.sort((a, b) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0))
	} else if (sort.method === 'Last Modified') {
		if (sort.direction === 'down')
			sortedFiles = files.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
		else if (sort.direction === 'up')
			sortedFiles = files.sort((a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt))
	} else if (sort.method === 'File Size') {
		if (sort.direction === 'down')
			sortedFiles = files.sort((a, b) => (a.size > b.size ? -1 : a.size < b.size ? 1 : 0))
		else if (sort.direction === 'up')
			sortedFiles = files.sort((a, b) => (a.size < b.size ? -1 : a.size > b.size ? 1 : 0))
	}

	return sortedFiles
}

export default applyCloudSort