/* eslint-disable no-unused-vars */

import { Box, Circle, Drawer, DrawerContent, DrawerOverlay, MenuDivider, Text } from '@chakra-ui/react'
import { Dispatch, RootState } from 'main/store/store'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { UserStatus } from '@types'
import storage from 'library/utilities/storage'
import socket from 'main/socket'
import ContextMenuItem from '../ContextMenuItem/ContextMenuItem'
import ContextMenuList from '../ContextMenuList/ContextMenuList'
import Invisible from '../Invisible'
import AccountSwitcherButton from './AccountSwitcherButton'

interface IProps {
	isOpen: boolean,
	onClose: () => void
}

const StatusSwitcherMobile: React.FC<IProps> = ({ isOpen, onClose }) => {
	const status = useSelector((state: RootState) => state.user.status)

	const changeStatus = (newStatus: Noonly.API.Data.UserStatus) => {
		onClose()
		if (status === newStatus) return
		socket.emit('USER_SET_STATUS', { status: newStatus })
	}

	return (
		<Drawer
			placement='bottom'
			isOpen={isOpen}
			motionPreset='none'
			onClose={onClose}
		>
			<DrawerOverlay />
			<DrawerContent roundedTop='lg'>
				<ContextMenuList>
					<ContextMenuItem active={status === UserStatus.ONLINE} onClick={() => changeStatus(UserStatus.ONLINE)} >
						<Circle size='3' bg='green.400' mr='3' />
						Online
					</ContextMenuItem>
					<ContextMenuItem active={status === UserStatus.IDLE} onClick={() => changeStatus(UserStatus.IDLE)} >
						<Circle size='3' bg='yellow.400' mr='3' />
						Idle
					</ContextMenuItem>
					<ContextMenuItem active={status === UserStatus.DO_NOT_DISTURB} onClick={() => changeStatus(UserStatus.DO_NOT_DISTURB)} >
						<Circle size='3' bg='red.400' mr='3' />
						Do not Disturb
					</ContextMenuItem>
					<ContextMenuItem active={status === UserStatus.INVISIBLE} onClick={() => changeStatus(UserStatus.INVISIBLE)} >
						<Circle size='3' bg='gray.400' mr='3' />
						Invisible
					</ContextMenuItem>
				</ContextMenuList>
			</DrawerContent>
		</Drawer>
	)
}

interface SelectorProps {
	addresses: Noonly.API.Data.UserAddress[],
	selectedAddress: string
}

const AddressSelector: React.FC<SelectorProps> = ({ addresses, selectedAddress }) => {
	const dispatch = useDispatch()

	return (
		<Box>
			<Text ml='1' fontWeight={600} mb='2'>
				Select Address
			</Text>
			<Box maxH='200px' overflow='scroll'>
				{addresses.map(({ id, address, unread, incoming }) => (
					<Box
						key={id}
						fontWeight='semibold'
						rounded='md'
						py='2'
						px='3'
						color='gray.300'
						transition='none'
						_hover={{ bg: 'blue.600', color: 'white' }}
						_active={{ bg: 'blue.600', color: 'white' }}
						display='flex'
						alignItems='center'
						onClick={() => dispatch.user.setSelectedAddress(id)}
					>
						<svg className='chakra-menu__icon' width='1em' height='1em' viewBox='0 0 14 14'>
							<Invisible invisible={id !== selectedAddress}>
								<polygon fill='currentColor' points='5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.9968652 0 6.49933039' />
							</Invisible>
						</svg>
						<Box
							ml='3'
							display='flex'
							alignItems='center'
							justifyContent='space-between'
						>
							{address}
							<Invisible visible={(unread || 0) > 0 || incoming === true}>
								<Circle size='2' bg='blue.400' />
							</Invisible>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	)
}

const AccountSwitcherMobile: React.FC = () => {
	const user = useSelector((state: RootState) => state.user)
	const visibleAddresses = user.addresses?.filter((address) => address.visible).sort((a, b) => a.order - b.order)
	const dispatch: Dispatch = useDispatch()
	const hiddenAddressesIds = user.addresses?.filter((address) => !address.visible).filter((address) => (address.unread || 0) > 0 || address.incoming).map((address) => address.id)
	const hasHiddenUnread = (hiddenAddressesIds?.length || 0) > 0
	const hasIncomingNotSelected = (user.addresses?.filter((address) => address.id !== user?.selectedAddress)?.filter((address) => address.incoming)?.length || 0) > 0
	const hasHiddenIncoming = (user.addresses?.filter((address) => !address.visible).filter((address) => address.incoming)?.length || 0) > 0

	const [isOpen, setIsOpen] = useState(false)
	const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false)

	const onLogout = () => {
		/*
		 * toast.show('You will be logged out soon')
		 * setTimeout(() => storage.logout(), 3000)
		 */
		storage.logout()
	}

	useEffect(() => {
		if (isOpen || isStatusMenuOpen) {
			dispatch.functions.setBlockLocationChange({
				func: () => {
					if (isStatusMenuOpen)
						setIsStatusMenuOpen(false)
					else
						setIsOpen(false)
				}
			})
		} else {
			dispatch.functions.setBlockLocationChange({ func: null })
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, isStatusMenuOpen])

	return (<>
		<AccountSwitcherButton
			showBlue={hasHiddenUnread || hasIncomingNotSelected || hasHiddenIncoming}
			onClick={() => setIsOpen(true)}
		/>
		<StatusSwitcherMobile isOpen={isStatusMenuOpen} onClose={() => setIsStatusMenuOpen(false)} />
		<Drawer
			placement='bottom'
			isOpen={isOpen}
			onClose={() => setIsOpen(false)}
		>
			<DrawerOverlay />
			<DrawerContent roundedTop='lg'>
				<ContextMenuList>
					<AddressSelector addresses={visibleAddresses || []} selectedAddress={user.selectedAddress || ''} />
					<MenuDivider my='1' />
					<ContextMenuItem onClick={() => {
						setIsOpen(false)
						dispatch.sidebar.setOpen(false)
						dispatch.modal.open({ id: 4, data: { highlight: hiddenAddressesIds } })
					}}>
						Manage addresses
					</ContextMenuItem>
					<ContextMenuItem onClick={() => {
						setIsStatusMenuOpen(true)
					}}>
						Set Status
					</ContextMenuItem>
					<ContextMenuItem onClick={() => {
						setIsOpen(false)
						dispatch.sidebar.setOpen(false)
						dispatch.modal.open({ id: 5, data: { type: 'AVATAR' } })
					}}>
						Change Avatar
					</ContextMenuItem>
					<MenuDivider my='1' />
					<ContextMenuItem alert onClick={() => {
						setIsOpen(false)
						dispatch.sidebar.setOpen(false)
						onLogout()
					}}>
						Logout
					</ContextMenuItem>
				</ContextMenuList>
			</DrawerContent>
		</Drawer>
	</>)
}

export default AccountSwitcherMobile