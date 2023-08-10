import { LinkProps, Link as RouterLink } from 'react-router-dom'
import { chakra, useColorModeValue } from '@chakra-ui/system'

import { ChakraProps } from '@chakra-ui/react'

const Link: React.FC<LinkProps & Partial<ChakraProps>> = (props) => (
	<RouterLink {...props}>
		<chakra.a
			marginStart='1'
			color={useColorModeValue('blue.500', 'blue.200')}
			_hover={{ color: useColorModeValue('blue.600', 'blue.300') }}
			display={{ base: 'block', sm: 'inline' }}
			{...props}
		/>
	</RouterLink>
)

export default Link