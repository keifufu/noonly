function applyFriendFilter(friends, tabValue) {
	return Object.values(friends).filter((friend) => {
		if (tabValue === 0 && friend.isOnline) return true
		if (tabValue === 1 && !friend.requestType) return true
		if (tabValue === 2 && friend.requestType) return true
		// if (tabValue === 3 && friend.blocked)
		return false
	})
}

export default applyFriendFilter