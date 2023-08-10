import { Box } from '@chakra-ui/react'
import Logo from '../Logo/Logo'
import useIsMobile from 'library/hooks/useIsMobile'

interface IProps {
	text: string
}

const EmptyPageMessage: React.FC<IProps> = ({ text }) => {
	const isMobile = useIsMobile()

	return (
		<Box
			h='full'
			display='flex'
			alignItems='center'
			justifyContent='center'
			flexDir='column'
			userSelect='none'
		>
			<Logo size={isMobile ? 2 : 2.5} />
			<Box
				mt='8'
				fontSize={{ base: '26', md: '32' }}
				fontWeight={600}
				letterSpacing='wide'
			>
				{text}
			</Box>
		</Box>
	)
}

export default EmptyPageMessage