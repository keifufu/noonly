import * as React from 'react'

import { Box, HStack } from '@chakra-ui/react'

import { IconType } from 'react-icons'

interface IProps {
	active: string,
	subtle?: boolean,
	icon: IconType,
	label: string,
	endElement?: JSX.Element,
	onClick: (location: string) => void,
	location: string
}

const NavItem: React.FC<IProps> = React.memo(({ active, subtle, icon: Icon, label, endElement, onClick, location }) => {
	const isActive = location?.split('/').length > 2 ? active.includes(location) : active === location

	return (<>
		<HStack
			onClick={() => onClick(location)}
			w='full'
			px='3'
			py='2'
			cursor='pointer'
			userSelect='none'
			rounded='md'
			transition='all 0.2s'
			bg={isActive ? 'gray.700' : undefined}
			_hover={{ bg: 'gray.700' }}
			_active={{ bg: 'gray.600' }}
		>
			<Box fontSize='lg' color={isActive ? 'currentcolor' : 'gray.400'}>
				<Icon />
			</Box>
			<Box flex='1' fontWeight='inherit' color={subtle ? 'gray.400' : undefined}>
				{label}
			</Box>
			{endElement && <Box>{endElement}</Box>}
		</HStack>
	</>)
}, (prevProps, nextProps) => {
	if (prevProps.endElement !== nextProps.endElement)
		return false
	const isActive = prevProps.location?.split('/').length > 2 ? prevProps.active.includes(prevProps.location) : prevProps.active === prevProps.location
	const isActiveNext = nextProps.location?.split('/').length > 2 ? nextProps.active.includes(nextProps.location) : nextProps.active === nextProps.location
	if (!isActiveNext && !isActive)
		return true
	return false
})

export default NavItem