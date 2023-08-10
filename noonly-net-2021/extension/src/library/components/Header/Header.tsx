import { Box } from '@chakra-ui/react'
import { Dispatch } from 'main/store/store'
import IconButton from '../IconButton'
import Invisible from '../Invisible/Invisible'
import { MdMenu } from 'react-icons/md'
import SearchInput from './SearchInput'
import SortingMenu from './SortingMenu'
import isExtension from 'library/utilities/isExtension'
import uppercase from 'library/utilities/uppercase'
import { useDispatch } from 'react-redux'
import useIsMobile from 'library/hooks/useIsMobile'
import { useLocation } from 'react-router-dom'

interface LocationStateProps {
	headerText?: string
}

const Header: React.FC = () => {
	const location = useLocation()
	const isMobile = useIsMobile()
	const dispatch: Dispatch = useDispatch()
	const locationState = location.state as LocationStateProps

	return (
		<Box
			m={{ base: '2', md: '0' }}
			mb='1'
			rounded={{ base: 'lg', md: 'none' }}
			h={{ base: '54px', md: '60px' }}
			bg='gray.700'
			color='white'
			fontSize='xl'
			display='flex'
			alignItems='center'
			justifyContent='space-between'
			px={{ base: '2', md: '6' }}
			shadow={{ base: 'lg', md: 'none' }}
		>
			<Invisible invisible={!isMobile || isExtension}>
				<IconButton
					aria-label='Toggle Sidebar'
					variant='ghost'
					onClick={() => dispatch.sidebar.toggle()}
					rIcon={MdMenu}
					rIconSize='24'
				/>
			</Invisible>
			<Invisible invisible={isMobile}>
				<Box
					textOverflow='ellipsis'
					whiteSpace='nowrap'
					overflow='hidden'
					flex='1'
					mr='10'
				>
					{
						locationState?.headerText
							? `${location.pathname.slice(1).split('/').slice(0).slice(0, -1).map((e) => uppercase(e)).join(' / ')} / ${locationState.headerText}`
							: location.pathname.slice(1).split('/').slice(0).map((e) => uppercase(e)).join(' / ') || 'Homepage'
					}
				</Box>
			</Invisible>
			<Box
				mr='2'
				ml={{ base: isExtension ? '0' : '2', md: '0' }}
			>
				<SearchInput />
			</Box>
			<SortingMenu />
		</Box>
	)
}

export default Header