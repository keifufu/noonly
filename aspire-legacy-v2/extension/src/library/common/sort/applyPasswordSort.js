function applyPasswordSort(passwords, sort) {
	let returnValue = []
	if (sort.by === 'Name') {
		if (sort.direction === 'Down')
			returnValue = passwords.sort((a, b) => (a.site < b.site ? -1 : a.site > b.site ? 1 : 0))
		else if (sort.direction === 'Up')
			returnValue = passwords.sort((a, b) => (a.site > b.site ? -1 : a.site < b.site ? 1 : 0))
	} else if (sort.by === 'Last Modified') {
		if (sort.direction === 'Down')
			returnValue = passwords.sort((a, b) => new Date(parseInt(b.modifiedAt)) - new Date(parseInt(a.modifiedAt)))
		else if (sort.direction === 'Up')
			returnValue = passwords.sort((a, b) => new Date(parseInt(a.modifiedAt)) - new Date(parseInt(b.modifiedAt)))
	}

	return returnValue
}

export default applyPasswordSort