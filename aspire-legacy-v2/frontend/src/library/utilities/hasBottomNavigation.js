function hasBottomNavigation(pathname, isMobile) {
	if (!isMobile) return false
	if (pathname.includes('/inbox')) return true
	if (pathname.includes('/cloud')) return true
	return false
}

export default hasBottomNavigation