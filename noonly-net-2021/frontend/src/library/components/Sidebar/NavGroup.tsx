import { Box, Collapse, Stack, Text } from '@chakra-ui/react'
import { memo, useState } from 'react'

interface IProps {
	label: string
}

const NavGroup: React.FC<IProps> = memo(({ label, children }) => {
	const [collapsed, setCollapsed] = useState(false)

	return (
		<Box>
			<Text
				onClick={() => setCollapsed(!collapsed)}
				cursor='pointer'
				px='3'
				fontSize='xs'
				fontWeight='semibold'
				textTransform='uppercase'
				letterSpacing='widest'
				transition='all 0.2s'
				color='gray.500'
				mb={collapsed ? undefined : '3'}
				userSelect='none'
			>
				{label}
			</Text>
			<Collapse in={!collapsed} animateOpacity>
				<Stack spacing='1'>{children}</Stack>
			</Collapse>
		</Box>
	)
})

export default NavGroup