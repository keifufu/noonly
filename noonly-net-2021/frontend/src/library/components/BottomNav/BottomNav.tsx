import { MdArchive, MdDelete, MdImage, MdInbox, MdStar } from 'react-icons/md'
import { useHistory, useLocation } from 'react-router-dom'

import { Box } from '@chakra-ui/react'
import useIsMobile from 'library/hooks/useIsMobile'
import { IconType } from 'react-icons'
import { BiLock } from 'react-icons/bi'
import styles from './BottomNav.module.scss'

interface Tab {
	name: string,
	icon: IconType,
	location: string
}

interface Tabs {
	[name: string]: Tab[]
}

const tabs: Tabs = {
	mail: [
		{
			name: 'Inbox',
			icon: MdInbox,
			location: '/mail/inbox'
		},
		{
			name: 'Archived',
			icon: MdArchive,
			location: '/mail/archived'
		},
		{
			name: 'Trash',
			icon: MdDelete,
			location: '/mail/trash'
		}
		/*
		 * {
		 * 	name: 'Sent',
		 * 	icon: MdSend,
		 * 	location: '/mail/sent'
		 * }
		 */
	],
	accounts: [
		{
			name: 'Accounts',
			icon: BiLock,
			location: '/accounts'
		},
		{
			name: 'Trash',
			icon: MdDelete,
			location: '/accounts/trash'
		}
	],
	screenshots: [
		{
			name: 'Screenshots',
			icon: MdImage,
			location: '/screenshots'
		},
		{
			name: 'Favorite',
			icon: MdStar,
			location: '/screenshots/favorite'
		},
		{
			name: 'Trash',
			icon: MdDelete,
			location: '/screenshots/trash'
		}
	],
	cloud: []
}

const BottomNav: React.FC = () => {
	const history = useHistory()
	const location = useLocation()
	const isMobile = useIsMobile()
	const currentTabs = tabs[location.pathname.slice(1).split('/')[0]]
	if (!isMobile || !currentTabs) return null
	/* Don't show BottomNav when viewing Mail */
	if (location.pathname.startsWith('/mail/view')) return null

	return (
		<Box
			bg='gray.600'
			flex='0 0 auto'
			display='flex'
			// roundedTop='lg'
			className={styles.root}
		>
			{currentTabs.map((tab, i) => {
				const Icon = tab.icon
				const isActive = tab.location.split('/').length > 2 ? location.pathname.startsWith(tab.location) : location.pathname === tab.location
				return (
					<Box
						/*
						 * roundedTopLeft={i === 0 ? 'lg' : undefined}
						 * roundedTopRight={i + 1 === currentTabs.length ? 'lg' : undefined}
						 */
						bg='gray.700'
						color={isActive ? 'blue.400' : undefined}
						_active={{ bg: 'blue.700' }}
						transition='all linear 0.1s'
						flex='1'
						p='2'
						key={tab.location}
						onClick={() => history.push(tab.location)}
						display='flex'
						flexDirection='column'
						alignItems='center'
						justifyContent='center'
						userSelect='none'
						cursor='pointer'
					>
						<Icon size='24' />
						<Box
							fontSize='sm'
							transform={isActive ? 'scale(1.2)' : undefined}
							transition='all linear 0.1s'
						>
							{tab.name}
						</Box>
					</Box>
				)
			})}
		</Box>
	)
}

export default BottomNav