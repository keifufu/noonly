import { Box, HStack, Stack } from '@chakra-ui/react'
import { memo, useEffect, useState } from 'react'

import { BsCaretRightFill } from 'react-icons/bs'
import Collapsible from '../Collapsible'
import { IconType } from 'react-icons'
import { useLocation } from 'react-router-dom'

interface IProps {
	active: string,
	subtle?: boolean,
	icon: IconType,
	label: string,
	color?: string
}

const NavItemCollapsible: React.FC<IProps> = memo(({ active, subtle, icon: Icon, children, label, color = 'none' }) => {
	const childrenLocations = (children as JSX.Element[])?.map((child) => child.props.location)
	const [extended, setExtended] = useState(childrenLocations.includes(active))
	const isActive = !extended && childrenLocations.includes(active)
	const location = useLocation()

	useEffect(() => {
		let includesChild = false
		childrenLocations.forEach((l) => {
			if (location.pathname.includes(l))
				includesChild = true
		})

		if (!childrenLocations.includes(active))
			setExtended(false)
		if (childrenLocations.includes(location.pathname) || includesChild)
			setExtended(true)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [active, location.pathname])

	return (<>
		<HStack
			onClick={() => {
				setExtended(!extended)
			}}
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
			<Box color={color} transition='transform 0.15s linear' transform={`rotate(${extended ? '90' : '0'}deg)`} fontSize='xs' flexShrink={0} as={BsCaretRightFill} />
		</HStack>
		<Collapsible open={extended}>
			<Stack pt='1' transition='all 0.2s' pl='5' spacing={1}>{children}</Stack>
		</Collapsible>
	</>)
})

export default NavItemCollapsible