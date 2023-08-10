function applyAccountSort(accounts, sort) {
	let sortedAccounts = []
	if (sort.by === 'Name') {
		if (sort.direction === 'Down')
			sortedAccounts = accounts.sort((a, b) => (a.site < b.site ? -1 : a.site > b.site ? 1 : 0))
		else if (sort.direction === 'Up')
			sortedAccounts = accounts.sort((a, b) => (a.site > b.site ? -1 : a.site < b.site ? 1 : 0))
	} else if (sort.by === 'Last Modified') {
		if (sort.direction === 'Down')
			sortedAccounts = accounts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
		else if (sort.direction === 'Up')
			sortedAccounts = accounts.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
	}

	return sortedAccounts
}

export default applyAccountSort