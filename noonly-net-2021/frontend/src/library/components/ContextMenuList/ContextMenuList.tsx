import { Box, BoxProps, MenuList, MenuListProps, forwardRef } from '@chakra-ui/react'

import isExtension from 'library/utilities/isExtension'
import { memo } from 'react'
import useIsMobile from 'library/hooks/useIsMobile'

const ContextMenuList: React.FC<Partial<BoxProps> & Partial<MenuListProps>> = memo(forwardRef(({ children, ...rest }, ref) => {
	const isMobile = useIsMobile(!isExtension)

	if (isMobile) {
		return (
			<Box ref={ref} px='2' py='2' {...rest}>
				{children}
			</Box>
		)
	} else {
		return (
			<MenuList ref={ref} px='2' {...rest}>
				{children}
			</MenuList>
		)
	}
}))

export default ContextMenuList