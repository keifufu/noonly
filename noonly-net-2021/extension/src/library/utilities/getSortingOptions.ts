const getSortingOptions = (pathname: string): any[] => {
	if (pathname.startsWith('/screenshots'))
		return ['Date', 'Type', 'File Size']
	if (pathname.startsWith('/accounts'))
		return ['Name', 'Last Modified', 'Creation Date']
	if (pathname.startsWith('/cloud'))
		return ['Name', 'Last Modified', 'File Size']
	return []
}

export default getSortingOptions