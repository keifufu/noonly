import { Box, Circle, Menu, MenuDivider, MenuItemOption, MenuOptionGroup, Text, useMenuButton } from '@chakra-ui/react'
import { Dispatch, RootState } from 'main/store/store'
import { useDispatch, useSelector } from 'react-redux'

import storage from 'library/utilities/storage'
import { memo } from 'react'
import ContextMenuItem from '../ContextMenuItem'
import ContextMenuList from '../ContextMenuList'
import Invisible from '../Invisible'
import { onSubmitProps } from '../Modals/modals/AlertModal'
import AccountSwitcherButton from './AccountSwitcherButton'
import StatusMenu from './StatusMenu'

interface IProps {
	showBlue: boolean
}

const MenuButton: React.FC<IProps> = memo(({ showBlue }) => {
	const buttonProps = useMenuButton()
	return (
		<AccountSwitcherButton showBlue={showBlue} {...buttonProps} />
	)
})

const AccountSwitcher: React.FC = memo(() => {
	const user = useSelector((state: RootState) => state.user)
	const visibleAddresses = user.addresses?.filter((address) => address.visible).sort((a, b) => a.order - b.order)
	const dispatch: Dispatch = useDispatch()
	const hiddenAddressesIds = user.addresses?.filter((address) => !address.visible).filter((address) => (address.unread || 0) > 0 || address.incoming).map((address) => address.id)
	const hasHiddenUnread = (hiddenAddressesIds?.length || 0) > 0
	const hasAnyUnread = (user.addresses?.filter((address) => (address.id !== user.selectedAddress && (address.unread || 0)) > 0)?.length || 0) > 0
	const hasIncomingNotSelected = (user.addresses?.filter((address) => address.id !== user.selectedAddress).filter((address) => address.incoming).length || 0) > 0
	const hasHiddenIncoming = (user.addresses?.filter((address) => !address.visible).filter((address) => address.incoming).length || 0) > 0

	const onLogout = () => {
		/*
		 * toast.show('You will be logged out soon')
		 * setTimeout(() => storage.logout(), 3000)
		 */
		storage.logout()
	}

	return (
		<Menu>
			<MenuButton showBlue={hasAnyUnread || hasIncomingNotSelected || hasHiddenIncoming} />
			<ContextMenuList>
				<Text fontWeight={600} mb='2'>
					Select Address
				</Text>
				<Box maxH='200px' overflow='scroll'>
					<MenuOptionGroup
						value={user.selectedAddress || ''}
						onChange={(value) => {
							dispatch.user.setSelectedAddress(value as string)
						}}
					>
						{visibleAddresses?.map(({ id, address, unread, incoming }) => (
							<MenuItemOption
								key={id}
								value={id}
								fontWeight='semibold'
								rounded='md'
								color='gray.300'
								transition='none'
								_hover={{ bg: 'blue.600', color: 'white' }}
								_active={{ bg: 'blue.600', color: 'white' }}
							>
								<Box
									display='flex'
									alignItems='center'
									justifyContent='space-between'
								>
									{address}
									<Invisible visible={(unread || 0) > 0 || incoming === true}>
										<Circle size='2' bg='blue.400' />
									</Invisible>
								</Box>
							</MenuItemOption>
						))}
					</MenuOptionGroup>
				</Box>
				<MenuDivider />
				<ContextMenuItem
					onClick={() => dispatch.modal.open({ id: 4, data: { highlight: hiddenAddressesIds } })}
				>
					<Box
						width='100%'
						display='flex'
						alignItems='center'
						justifyContent='space-between'
					>
						Manage addresses
						<Invisible visible={hasHiddenUnread || hasHiddenIncoming}>
							<Circle size='2' bg='blue.400' />
						</Invisible>
					</Box>
				</ContextMenuItem>
				<StatusMenu />
				<ContextMenuItem
					onClick={() => dispatch.modal.open({ id: 5, data: { type: 'AVATAR' } })}
				>
					Change Avatar
				</ContextMenuItem>
				<MenuDivider />
				<ContextMenuItem
					alert
					onClick={() => {
						dispatch.modal.open({
							id: 9,
							data: {
								header: 'Log out?',
								text: 'Are you sure you want to log out?',
								buttons: ['Cancel', 'Logout'],
								onSubmit: ({ onSuccess, onFail }: onSubmitProps) => {
									onSuccess()
									onLogout()
								}
							}
						})
					}}
				>
					Logout
				</ContextMenuItem>
			</ContextMenuList>
		</Menu>
	)
})

export default AccountSwitcher