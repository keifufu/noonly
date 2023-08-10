import { Box, BoxProps } from '@chakra-ui/react'

const Card: React.FC<BoxProps> = (props) => (
	<Box
		bg='gray.700'
		py={{ base: '4', md: '8' }}
		px={{ base: '4', md: '10' }}
		shadow='base'
		rounded='md'
		{...props}
	/>
)

export default Card