import { Tooltip as ChakraTooltip, TooltipProps } from '@chakra-ui/react'

type IProps = TooltipProps

const Tooltip: React.FC<IProps> = ({ ...rest }) => (
	<ChakraTooltip placement='top' hasArrow openDelay={500} {...rest} />
)

export default Tooltip