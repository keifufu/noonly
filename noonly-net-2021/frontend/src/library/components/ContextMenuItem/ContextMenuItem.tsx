import { Box, BoxProps, MenuItem, MenuItemProps, forwardRef } from '@chakra-ui/react'
import { memo, useContext } from 'react'

import { IconType } from 'react-icons'
import { MenuContext } from '../ContextMenu/ContextMenu'
import useIsMobile from 'library/hooks/useIsMobile'

interface IProps {
	alert?: boolean,
	active?: boolean,
	rIcon?: IconType
}

const ContextMenuItem: React.FC<IProps & Partial<MenuItemProps> & Partial<BoxProps>> = memo(forwardRef(({ children, alert, active, rIcon: Icon, ...rest }, ref) => {
	const isExtension = process.env.REACT_APP_IS_EXTENSION === 'true'
	const isMobile = useIsMobile(!isExtension)
	const styleProps = alert
		? { _hover: { bg: 'red.500', color: 'white' }, color: 'red.500' }
		: { _hover: { bg: 'blue.600', color: 'white' } }
	const activeProps = active ? { bg: 'blue.600' } : {}
	const menuContext = useContext(MenuContext)

	if (isMobile) {
		return (
			<Box
				ref={ref}
				rounded='md'
				color='gray.300'
				transition='none'
				{...styleProps}
				{...activeProps}
				{...rest}
				display='flex'
				alignItems='center'
				p='2'
				onClick={(e) => {
					rest.onClick?.(e)
					menuContext.onClose?.()
				}}
				cursor='pointer'
			>
				<Box mr='1'>
					{Icon ? <Icon size='20' /> : rest.icon}
				</Box>
				{children}
			</Box>
		)
	} else {
		return (
			<MenuItem
				ref={ref}
				rounded='md'
				color='gray.300'
				transition='none'
				{...styleProps}
				{...activeProps}
				{...rest}
				icon={Icon ? <Icon size='20' /> : rest.icon}
			>
				{children}
			</MenuItem>
		)
	}
}))

export default ContextMenuItem