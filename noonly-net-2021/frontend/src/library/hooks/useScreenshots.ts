import { RootState } from 'main/store/store'
import useScreenshotSort from './useScreenshotSort'
import { useSelector } from 'react-redux'

const useScreenshots = (trash: boolean, favorite: boolean): [Noonly.API.Data.Screenshot[], Noonly.State.SortValue] => {
	const screenshots = useSelector((state: RootState) => state.screenshots)
	const visibleScreenshots = screenshots.filter((screenshot) => (trash ? screenshot.trash : !screenshot.trash))
		.filter((screenshot) => (favorite ? screenshot.favorite : true))
	const [sortedScreenshots, sort] = useScreenshotSort(visibleScreenshots)

	return [sortedScreenshots, sort]
}

export default useScreenshots