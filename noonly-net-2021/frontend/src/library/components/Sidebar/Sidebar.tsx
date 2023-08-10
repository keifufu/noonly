import { Box, Circle, Flex, Stack } from '@chakra-ui/react'
import { Dispatch, RootState } from 'main/store/store'
import { useEffect, useState } from 'react'
import { AiOutlineCalendar, AiOutlineFileSync } from 'react-icons/ai'
import { BiBuoy, BiCloud, BiCog, BiEnvelope, BiHome, BiImage, BiLinkAlt, BiLock, BiMessage } from 'react-icons/bi'
import { MdArchive, MdDelete, MdFolder, MdFolderShared, MdInbox, MdSend, MdStar } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'

import useIsMobile from 'library/hooks/useIsMobile'
import AccountSwitcher from './AccountSwitcher'
import AccountSwitcherMobile from './AccountSwitcherMobile'
import NavGroup from './NavGroup'
import NavItem from './NavItem'
import NavItemCollapsible from './NavItemCollapsible'

interface IProps {
  onClose?: () => void
}

const Sidebar: React.FC<IProps> = ({ onClose }) => {
	const [active, setActive] = useState(window.location.pathname)
	const isMobile = useIsMobile()
	// const sidebarIsOpen = useSelector((state: RootState) => state.sidebar.open)
	const user = useSelector((state: RootState) => state.user)
	const dispatch: Dispatch = useDispatch()
	const location = useLocation()
	const history = useHistory()

	const currentAddressHasUnread = (user.addresses?.find((e) => e.id === user.selectedAddress)?.unread || 0) > 0
	const currentAddressHasIncoming = user.addresses?.find((e) => e.id === user.selectedAddress)?.incoming
	const showBlueDot = currentAddressHasUnread || currentAddressHasIncoming

	const onNavItemClick = (location: string) => {
		if (active === location) return
		setActive(location)
		history.push(location)
		if (isMobile) {
			dispatch.sidebar.setOpen(false)
			if (onClose) onClose()
		}
	}

	useEffect(() => {
		if (location.pathname !== active)
			setActive(location.pathname)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location])

	if (isMobile) {
		return (
			<Box h='full' bg='gray.900' color='white' fontSize='sm' pb='1'>
				<Flex h='full' direction='column' px='4' py='4'>
					<AccountSwitcherMobile />
					<Box h='full' overflow='scroll' pt='4' pb='8'>
						<Stack spacing='1'>
							<NavItem onClick={onNavItemClick} active={active} icon={BiHome} location='/home' label='Homepage' />
						</Stack>
						<Stack spacing='8' flex='1' overflow='auto' pt='4'>
							<NavGroup label='Your Services'>
								<NavItem onClick={onNavItemClick} active={active} icon={BiEnvelope} location='/mail/inbox' label='Mail' />
								<NavItem onClick={onNavItemClick} active={active} icon={BiLock} location='/accounts' label='Accounts' />
								<NavItem onClick={onNavItemClick} active={active} icon={BiImage} location='/screenshots' label='Screenshots' />
								<NavItem onClick={onNavItemClick} active={active} icon={BiCloud} location='/cloud/user' label='Cloud' />
								<NavItem onClick={onNavItemClick} active={active} icon={BiMessage} location='/chat' label='Chat' />
							</NavGroup>
							<NavGroup label='Other Tools'>
								<NavItem onClick={onNavItemClick} active={active} icon={BiLinkAlt} location='/urls' label='URL Shortener' />
								<NavItem onClick={onNavItemClick} active={active} icon={AiOutlineFileSync} location='/convert' label='File Converter' />
								<NavItem onClick={onNavItemClick} active={active} icon={AiOutlineCalendar} location='/calendar' label='Calendar' />
							</NavGroup>
						</Stack>
					</Box>
					<Box>
						<Stack spacing='1' pb=''>
							<NavItem onClick={onNavItemClick} active={active} subtle icon={BiCog} location='/settings' label='Settings' />
							<NavItem
								onClick={onNavItemClick}
								active={active}
								subtle
								icon={BiBuoy}
								location='/help'
								label='Help & Support'
							/>
						</Stack>
					</Box>
				</Flex>
			</Box>
		)
	}

	/*
	 * if (isMobile) {
	 * 	return (
	 * 		<Drawer
	 * 			isOpen={alwaysOpen || sidebarIsOpen}
	 * 			placement='left'
	 * 			motionPreset='none'
	 * 			onClose={() => dispatch.sidebar.setOpen(false)}
	 * 		>
	 * 			<DrawerOverlay />
	 * 			<DrawerContent>
	 * 				<Box h='full' bg='gray.900' color='white' fontSize='sm' pb='1'>
	 * 					<Flex h='full' direction='column' px='4' py='4'>
	 * 						<AccountSwitcherMobile />
	 * 						<Box h='full' overflow='scroll' pt='4' pb='8'>
	 * 							<Stack spacing='1'>
	 * 								<NavItem onClick={onNavItemClick} active={active} icon={BiHome} location='/home' label='Homepage' />
	 * 							</Stack>
	 * 							<Stack spacing='8' flex='1' overflow='auto' pt='4'>
	 * 								<NavGroup label='Your Services'>
	 * 									<NavItem onClick={onNavItemClick} active={active} icon={BiEnvelope} location='/mail/inbox' label='Mail' />
	 * 									<NavItem onClick={onNavItemClick} active={active} icon={BiLock} location='/accounts' label='Accounts' />
	 * 									<NavItem onClick={onNavItemClick} active={active} icon={BiImage} location='/screenshots' label='Screenshots' />
	 * 									<NavItem onClick={onNavItemClick} active={active} icon={BiCloud} location='/cloud/user' label='Cloud' />
	 * 									<NavItem onClick={onNavItemClick} active={active} icon={BiMessage} location='/chat' label='Chat' />
	 * 								</NavGroup>
	 * 								<NavGroup label='Other Tools'>
	 * 									<NavItem onClick={onNavItemClick} active={active} icon={BiLinkAlt} location='/urls' label='URL Shortener' />
	 * 									<NavItem onClick={onNavItemClick} active={active} icon={AiOutlineFileSync} location='/convert' label='File Converter' />
	 * 									<NavItem onClick={onNavItemClick} active={active} icon={AiOutlineCalendar} location='/calendar' label='Calendar' />
	 * 								</NavGroup>
	 * 							</Stack>
	 * 						</Box>
	 * 						<Box>
	 * 							<Stack spacing='1' pb=''>
	 * 								<NavItem onClick={onNavItemClick} active={active} subtle icon={BiCog} location='/settings' label='Settings' />
	 * 								<NavItem
	 * 									onClick={onNavItemClick}
	 * 									active={active}
	 * 									subtle
	 * 									icon={BiBuoy}
	 * 									location='/help'
	 * 									label='Help & Support'
	 * 								/>
	 * 							</Stack>
	 * 						</Box>
	 * 					</Flex>
	 * 				</Box>
	 * 			</DrawerContent>
	 * 		</Drawer>
	 * 	)
	 * }
	 */

	return (
		<Box flexShrink={0} w='64' bg='gray.900' color='white' fontSize='sm'>
			<Flex h='full' direction='column' px='4' py='4'>
				<AccountSwitcher />
				<Box h='full' overflow='scroll' pb='8'>
					<Stack spacing='8' flex='1' overflow='auto' pt='8'>
						<Stack spacing='1'>
							<NavItem onClick={onNavItemClick} active={active} icon={BiHome} location='/' label='Homepage' />
						</Stack>
						<NavGroup label='Your Services'>
							<NavItemCollapsible active={active} icon={BiEnvelope} label='Mail' color={showBlueDot ? 'blue.400' : 'none'}>
								<NavItem onClick={onNavItemClick} active={active} icon={MdInbox}
									location='/mail/inbox' label='Inbox' endElement={showBlueDot ? <Circle size='2' bg='blue.400' /> : undefined} />
								<NavItem onClick={onNavItemClick} active={active} icon={MdArchive} location='/mail/archived' label='Archived' />
								<NavItem onClick={onNavItemClick} active={active} icon={MdDelete} location='/mail/trash' label='Trash' />
								<NavItem onClick={onNavItemClick} active={active} icon={MdSend} location='/mail/sent' label='Sent' />
							</NavItemCollapsible>
							<NavItemCollapsible active={active} icon={BiLock} label='Accounts'>
								<NavItem onClick={onNavItemClick} active={active} icon={BiLock} location='/accounts' label='Accounts' />
								<NavItem onClick={onNavItemClick} active={active} icon={MdDelete} location='/accounts/trash' label='Trash' />
							</NavItemCollapsible>
							<NavItemCollapsible active={active} icon={BiImage} label='Screenshots'>
								<NavItem onClick={onNavItemClick} active={active} icon={BiImage} location='/screenshots' label='Screenshots' />
								<NavItem onClick={onNavItemClick} active={active} icon={MdStar} location='/screenshots/favorite' label='Favorite' />
								<NavItem onClick={onNavItemClick} active={active} icon={MdDelete} location='/screenshots/trash' label='Trash' />
							</NavItemCollapsible>
							<NavItemCollapsible active={active} icon={BiCloud} label='Cloud'>
								<NavItem onClick={onNavItemClick} active={active} icon={MdFolder} location='/cloud/user' label='Your Files' />
								<NavItem onClick={onNavItemClick} active={active} icon={MdFolderShared} location='/cloud/shared' label='Shared' />
								<NavItem onClick={onNavItemClick} active={active} icon={MdDelete} location='/cloud/trash' label='Trash' />
							</NavItemCollapsible>
							<NavItem onClick={onNavItemClick} active={active} icon={BiMessage} location='/chat' label='Chat' />
						</NavGroup>
						<NavGroup label='Other Tools'>
							<NavItem onClick={onNavItemClick} active={active} icon={BiLinkAlt} location='/urls' label='URL Shortener' />
							<NavItem onClick={onNavItemClick} active={active} icon={AiOutlineFileSync} location='/convert' label='File Converter' />
							<NavItem onClick={onNavItemClick} active={active} icon={AiOutlineCalendar} location='/calendar' label='Calendar' />
						</NavGroup>
					</Stack>
				</Box>
				<Box>
					<Stack spacing='1'>
						<NavItem onClick={onNavItemClick} active={active} subtle icon={BiCog} location='/settings' label='Settings' />
						<NavItem
							onClick={onNavItemClick}
							active={active}
							subtle
							icon={BiBuoy}
							location='/help'
							label='Help & Support'
						/>
					</Stack>
				</Box>
			</Flex>
		</Box>
	)
}

export default Sidebar