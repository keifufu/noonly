function applyPasswordSearch(passwords, _searchInput) {
	const searchInput = _searchInput.toLowerCase()

	const filteredPasswords = passwords.filter((e) => {
		if (searchInput.length === 0
			|| e.site.toLowerCase().includes(searchInput)
			|| e.username.toLowerCase().includes(searchInput)
			|| e.email.toLowerCase().includes(searchInput))
			return true
		else return false
	})

	return filteredPasswords
}

export default applyPasswordSearch