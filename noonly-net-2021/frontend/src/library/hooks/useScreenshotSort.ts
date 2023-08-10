import { RootState } from 'main/store/store'
import { useSelector } from 'react-redux'

const useScreenshotSort = (screenshots: Noonly.API.Data.Screenshot[]): [Noonly.API.Data.Screenshot[], Noonly.State.SortValue] => {
	const sort = useSelector((state: RootState) => state.sort.screenshots)
	let sortedScreenshots: Noonly.API.Data.Screenshot[] = []

	if (sort.method === 'Date') {
		if (sort.direction === 'down')
			sortedScreenshots = screenshots.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
		else if (sort.direction === 'up')
			sortedScreenshots = screenshots.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
	} else if (sort.method === 'Type') {
		if (sort.direction === 'down')
			sortedScreenshots = screenshots.sort((a, b) => (a.type < b.type ? -1 : a.type > b.type ? 1 : 0))
		else if (sort.direction === 'up')
			sortedScreenshots = screenshots.sort((a, b) => (a.type > b.type ? -1 : a.type < b.type ? 1 : 0))
	} else if (sort.method === 'File Size') {
		if (sort.direction === 'down')
			sortedScreenshots = screenshots.sort((a, b) => b.size - a.size)
		else if (sort.direction === 'up')
			sortedScreenshots = screenshots.sort((a, b) => a.size - b.size)
	}

	return [sortedScreenshots, sort]
}

export default useScreenshotSort