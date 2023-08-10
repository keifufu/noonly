function applyCloudSearch(cloud, _searchInput) {
	const searchInput = _searchInput.toLowerCase()

	const filteredCloud = cloud.filter((e) => {
		if (searchInput.length === 0 || e.name.toLowerCase().includes(searchInput))
			return true
		else return false
	})

	return filteredCloud
}

export default applyCloudSearch