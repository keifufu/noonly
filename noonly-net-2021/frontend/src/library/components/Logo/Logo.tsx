import { Flex, FlexProps, Text } from '@chakra-ui/react'

interface IProps extends FlexProps {
	size?: number
}

const Logo: React.FC<IProps> = ({ size: _size = 1, ...props }) => {
	const size = _size > 1 ? _size * 0.75 : _size || 1

	return (
		<Flex
			justifyContent='center'
			alignItems='center'
			h='6'
			{...props}
		>
			<img height={size * 64} width={size * 64} src={`${process.env.PUBLIC_URL}/logo512.png`} alt='logo' />
			<Text ml='4' mt='8' mb='8' align='center' maxW='md' fontWeight='bold' letterSpacing='tight'>
				<Text as='span' fontSize={size * 30}>{process.env.REACT_APP_NAME}</Text>
			</Text>
		</Flex>
	)
}

export default Logo