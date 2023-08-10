import { Box, Menu, MenuButton, MenuDivider, MenuItemOption, MenuList, MenuOptionGroup, Text } from '@chakra-ui/react'
import { Dispatch, RootState } from 'main/store/store'
import { MdArrowDownward, MdArrowUpward } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'

import useIsMobile from 'library/hooks/useIsMobile'
import getSortingOptions from 'library/utilities/getSortingOptions'
import storage from 'library/utilities/storage'
import { memo } from 'react'
import { FaSort } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import ContextMenuItem from '../ContextMenuItem'
import IconButton from '../IconButton'
import Invisible from '../Invisible'
import { onSubmitProps } from '../Modals/modals/AlertModal'

type SortType = 'screenshots' | 'cloud' | 'accounts'

const SortingMenu: React.FC = memo(() => {
	const location = useLocation()
	const dispatch: Dispatch = useDispatch()
	const options = getSortingOptions(location.pathname)
	const type = location.pathname.slice(1).split('/')[0].toLowerCase()
	const typeSort: SortType = ['screenshots', 'cloud', 'accounts'].includes(type) ? type as SortType : 'cloud'
	const sort = useSelector((state: RootState) => state.sort[typeSort])
	const isExtension = process.env.REACT_APP_IS_EXTENSION === 'true'
	const isMobile = useIsMobile()
	const { direction, method } = sort

	const onLogout = () => {
		/*
		 * toast.show('You will be logged out soon')
		 * setTimeout(() => storage.logout(), 3000)
		 */
		storage.logout()
	}

	return (
		<Menu closeOnSelect={false}>
			<MenuButton as={IconButton} _active={{ bg: 'gray.600' }} rIcon={FaSort} tooltip={isMobile ? undefined : 'Change Sorting Options'} placement='left' />
			<MenuList px='2' zIndex={100}>
				<Box fontSize='sm'>
					<Invisible invisible={options.length > 0}>
						<Text fontWeight={600}>
							No sorting options for this page
						</Text>
					</Invisible>
					<Invisible invisible={options.length === 0}>
						<Text fontWeight={600} mb='2'>
							Sort By
						</Text>
						<MenuOptionGroup
							value={method}
							onChange={(method) => dispatch.sort.setMethod({ type: typeSort, method: method as string })}
						>
							{options.map((option) => (
								<MenuItemOption
									key={option}
									value={option}
									fontWeight='semibold'
									rounded='md'
									color='gray.300'
									transition='none'
									_hover={{ bg: 'blue.600', color: 'white' }}
									_active={{ bg: 'blue.600', color: 'white' }}
								>
									{option}
								</MenuItemOption>
							))}
						</MenuOptionGroup>
						<MenuDivider />
						<Box
							display='flex'
							alignItems='center'
							bg='gray.600'
							rounded='md'
						>
							<Box
								roundedLeft='md'
								transition='all linear 0.1s'
								p='2'
								cursor='pointer'
								_hover={{ bg: direction === 'down' ? 'blue.500' : 'gray.500' }}
								flex='1'
								display='flex'
								alignItems='center'
								justifyContent='center'
								bg={direction === 'down' ? 'blue.600' : undefined}
								onClick={() => dispatch.sort.setDirection({ type: typeSort, direction: 'down' })}
							>
								<MdArrowDownward size='20' />
							</Box>
							<Box
								roundedRight='md'
								transition='all linear 0.1s'
								p='2'
								cursor='pointer'
								_hover={{ bg: direction === 'up' ? 'blue.500' : 'gray.500' }}
								flex='1'
								display='flex'
								alignItems='center'
								justifyContent='center'
								bg={direction === 'up' ? 'blue.600' : undefined}
								onClick={() => dispatch.sort.setDirection({ type: typeSort, direction: 'up' })}
							>
								<MdArrowUpward size='20' />
							</Box>
						</Box>
						<Invisible visible={isExtension}>
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
						</Invisible>
					</Invisible>
				</Box>
			</MenuList>
		</Menu>
	)
})

export default SortingMenu