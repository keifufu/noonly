import { Box } from '@chakra-ui/layout'
import { Collapse } from '@chakra-ui/transition'

interface IProps {
	isDisconnected: boolean
}

const DisconnectWarning: React.FC<IProps> = ({ isDisconnected }) => (
	<Box
		position='fixed'
		top='0px'
		left='0px'
		width='100%'
		zIndex='99999999999'
	>
		<Collapse in={isDisconnected} animateOpacity>
			<Box
				px='2'
				py='1'
				roundedBottom='md'
				bg='blue.600'
				cursor='pointer'
				userSelect='none'
				display='flex'
				fontWeight='600'
				letterSpacing='wide'
				justifyContent='center'
			>
				Connecting...
			</Box>
		</Collapse>
	</Box>
)

export default DisconnectWarning