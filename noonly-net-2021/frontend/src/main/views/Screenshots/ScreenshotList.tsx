import ScreenshotCard, { ScreenshotCardSkeleton } from 'library/components/ScreenshotCard'
import store, { Dispatch, RootState } from 'main/store/store'
import { memo, useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Grid from '@bit/mui-org.material-ui.grid'
import { Box, Button } from '@chakra-ui/react'
import { SelectionTypes } from '@types'
import EmptyPageMessage from 'library/components/EmptyPageMessage'
import Invisible from 'library/components/Invisible'
import useIsMobile from 'library/hooks/useIsMobile'
import useScreenshots from 'library/hooks/useScreenshots'
import InfiniteScroll from 'react-infinite-scroll-component'
import { forceCheck } from 'react-lazyload'

interface IProps {
	hasLoaded: boolean,
	trash: boolean,
	favorite: boolean
}

const ScreenshotList: React.FC<IProps> = memo(({ hasLoaded, trash, favorite }) => {
	const [screenshots, sort] = useScreenshots(trash, favorite)
	const dispatch: Dispatch = useDispatch()
	const isMobile = useIsMobile()

	const selection = useSelector((state: RootState) => state.selection.screenshots)
	const getIds = useCallback((id) => (selection.length > 0 && selection.includes(id) ? selection : [id]), [selection])
	const [page, setPage] = useState(1)

	useEffect(() => setPage(1), [sort])

	useEffect(() => {
		dispatch.selection.setSelection({ type: SelectionTypes.SCREENSHOTS, ids: [] })
	}, [trash, favorite, dispatch.selection])

	useEffect(() => {
		setTimeout(() => forceCheck(), 100)
	}, [sort, screenshots])

	return (<>
		<Button mb='3' mr='3' onClick={() => store.dispatch.modal.open({ id: 12, data: screenshots })}>Export Screenshots</Button>
		<Invisible visible={!trash && !favorite && screenshots.length === 0 && hasLoaded}>
			<EmptyPageMessage text='You have no Screenshots' />
		</Invisible>
		<Invisible visible={!!favorite && screenshots.length === 0 && hasLoaded}>
			<EmptyPageMessage text='Your favorites are empty' />
		</Invisible>
		<Invisible visible={!!trash && screenshots.length === 0 && hasLoaded}>
			<EmptyPageMessage text='Your Trash is empty' />
		</Invisible>
		<InfiniteScroll
			loader={<></>}
			dataLength={page * 20}
			scrollableTarget='screenshot-container'
			next={() => {
				setPage((page) => page + 1)
			}}
			hasMore={page * 20 < screenshots.length}
			style={{ overflow: 'hidden' }}
			scrollThreshold='200px'
		>
			<Box mx={isMobile ? 2 : 0} my={isMobile ? 2 : 0}>
				<Grid container spacing={isMobile ? 1 : 2}>
					<Invisible invisible={hasLoaded}>
						{Array(12).fill(0).map((e, i) => (
							<Grid item xs={6} md={4} lg={3} key={i}>
								<ScreenshotCardSkeleton />
							</Grid>
						))}
					</Invisible>
					{screenshots.slice(0, page * 20).map((screenshot) => (
						<Grid item xs={6} md={4} lg={3} key={screenshot.id}>
							<ScreenshotCard
								screenshot={screenshot}
								isSelected={selection.includes(screenshot.id)}
								getIds={getIds}
							/>
						</Grid>
					))}
				</Grid>
			</Box>
		</InfiniteScroll>
	</>)
})

export default ScreenshotList