import { Box } from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { InitialLoadTypes } from '@types'
import PageProgress from 'library/components/PageProgress/PageProgress'
import ScreenshotList from './ScreenshotList'
import ScreenshotsFab from './ScreenshotsFab'
import useInitialLoad from 'library/hooks/useInitialLoad'

interface IProps {
	trash: boolean,
	favorite: boolean
}

const Screenshots: React.FC<IProps> = ({ trash, favorite }) => {
	const hasLoaded = useInitialLoad(InitialLoadTypes.SCREENSHOTS)

	return (<>
		<Helmet>
			<title>Screenshots - {process.env.REACT_APP_NAME}</title>
		</Helmet>
		<PageProgress loading={!hasLoaded} />
		<ScreenshotsFab trash={trash} />
		<Box
			overflowY='scroll'
			overflowX='hidden'
			rounded='md'
			h='full'
			id='screenshot-container'
		>
			<ScreenshotList hasLoaded={hasLoaded} trash={trash} favorite={favorite} />
		</Box>
	</>)
}

export default Screenshots