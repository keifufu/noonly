function applyAccountSearch(accounts, _searchInput) {
	const searchInput = _searchInput.toLowerCase()

	const filteredAccounts = accounts.filter((e) => {
		if (searchInput.length === 0
			|| e.site.toLowerCase().includes(searchInput)
			|| e.username.toLowerCase().includes(searchInput)
			|| e.email.toLowerCase().includes(searchInput))
			return true
		else return false
	})

	return filteredAccounts
}

export default applyAccountSearch