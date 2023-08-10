import { MdMenu } from 'react-icons/md'

import { Box } from '@chakra-ui/react'
import useIsMobile from 'library/hooks/useIsMobile'
import isExtension from 'library/utilities/isExtension'
import uppercase from 'library/utilities/uppercase'
import { Dispatch } from 'main/store/store'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import IconButton from '../IconButton'
import Invisible from '../Invisible/Invisible'
import SearchInput from './SearchInput'
import SortingMenu from './SortingMenu'

interface LocationStateProps {
	headerText?: string
}

const Header: React.FC = () => {
	const location = useLocation()
	const isMobile = useIsMobile()
	const dispatch: Dispatch = useDispatch()
	const locationState = location.state as LocationStateProps
	// const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme'))

	/*
	 * const toggleTheme = () => {
	 * 	const currentTheme = document.documentElement.getAttribute('data-theme')
	 * 	const targetTheme = currentTheme === 'light' ? 'dark' : 'light'
	 * 	document.documentElement.setAttribute('data-theme', targetTheme)
	 * 	localStorage.setItem('theme', targetTheme)
	 * 	setTheme(targetTheme)
	 * }
	 */

	return (
		<Box
			m={{ base: '0', md: '0' }}
			mb='1'
			// rounded={{ base: 'lg', md: 'none' }}
			h={{ base: '54px', md: '60px' }}
			bg='gray.700'
			color='white'
			fontSize='xl'
			display='flex'
			alignItems='center'
			justifyContent='space-between'
			px={{ base: '2', md: '6' }}
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
			{/* <IconButton
				aria-label='Toggle Theme (Experimental)'
				tooltip={theme === 'dark' ? 'Switch to light theme (Experimental)' : 'Switch to dark theme'}
				variant='ghost'
				onClick={toggleTheme}
				rIcon={theme === 'dark' ? MdLightMode : MdDarkMode}
				rIconSize='24'
				mr='2'
			/> */}
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