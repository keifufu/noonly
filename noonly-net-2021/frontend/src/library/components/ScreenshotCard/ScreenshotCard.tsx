import { Box, Img, Skeleton } from '@chakra-ui/react'
import { MdStar, MdStarBorder } from 'react-icons/md'
import { memo, useState } from 'react'

import { AiOutlineGif } from 'react-icons/ai'
import { Dispatch } from 'main/store/store'
import IconButton from '../IconButton'
import LazyLoad from 'react-lazyload'
import { SelectionTypes } from '@types'
import dayjs from 'dayjs'
import imgHost from 'library/utilities/imgHost'
import { useDispatch } from 'react-redux'
import useIsMobile from 'library/hooks/useIsMobile'

interface IProps {
	screenshot: Noonly.API.Data.Screenshot,
	isSelected: boolean,
	getIds: (id: string) => string[]
}

const ScreenshotCard: React.FC<IProps> = memo(({ screenshot, isSelected, getIds }) => {
	const [isLoading, setIsLoading] = useState(false)
	const dispatch: Dispatch = useDispatch()

	const isMobile = useIsMobile()
	const timeString = isMobile ? 'MMM DD[,] HH:mm' : 'MMM DD[,] YYYY [at] HH:mm'

	return (
		<Box
			bg={isSelected ? 'blue.600' : 'gray.700'}
			transform={isSelected ? 'scale(1.01)' : undefined}
			transition='all linear 0.1s'
			shadow='base'
			rounded='lg'
			onContextMenu={(e) => dispatch.contextMenu.open({ id: 2, e, data: screenshot })}
			cursor='pointer'
			onClick={(e) => {
				if (!e.ctrlKey) return
				dispatch.selection.toggleSelection({ type: SelectionTypes.SCREENSHOTS, id: screenshot.id })
			}}
			onDoubleClick={() => (isMobile ? dispatch.selection.toggleSelection({ type: SelectionTypes.SCREENSHOTS, id: screenshot.id }) : null)}
		>
			<LazyLoad offset={200} scrollContainer='#screenshot-container' once placeholder={
				<Skeleton rounded='lg' py='28' />
			}>
				<Box
					position='relative'
					h={{ base: '115', md: '230' }}
				>
					<Img
						onDragStart={(e) => {
							e.preventDefault()
							return false
						}}
						userSelect='none'
						position='absolute'
						w='full'
						h='full'
						rounded='lg'
						shadow='base'
						objectFit='cover'
						src={`${imgHost}/r/preview_${screenshot.name}`}
						alt={screenshot.name}
						cursor='pointer'
						onClick={(e) => !e.ctrlKey && dispatch.overlay.open({ id: 1, data: screenshot })}
					/>
					{ screenshot.type === 'gif' && (
						<Box
							position='absolute'
							as={AiOutlineGif}
							size='30'
							display='inline'
							right={3}
							top={2}
						/>
					)}
				</Box>
			</LazyLoad>
			<Box
				py={{ base: '1', md: '2' }}
				px={{ base: '2', md: '3' }}
				fontSize={16}
				color='gray.300'
				display='flex'
				alignItems='center'
				justifyContent='space-between'
			>
				{ dayjs(screenshot.createdAt).format(timeString) }
				<IconButton
					aria-label={screenshot.favorite ? 'Unfavorite' : 'Favorite'}
					tooltip={screenshot.favorite ? 'Unfavorite' : 'Favorite'}
					placement='left'
					disabled={isLoading}
					isLoading={isLoading}
					variant='ghost'
					rIcon={screenshot.favorite ? MdStar : MdStarBorder}
					size='sm'
					onClick={(e) => {
						if (e.ctrlKey) return
						setIsLoading(true)
						dispatch.screenshots.editFavorite({
							ids: getIds(screenshot.id),
							favorite: !screenshot.favorite,
							onSuccess: () => setIsLoading(false),
							onFail: () => setIsLoading(false)
						})
					}}
				/>
			</Box>
		</Box>
	)
})

export default ScreenshotCard