import { IconButton as ChakraIconButton, IconButtonProps as ChakraIconButtonProps, forwardRef } from '@chakra-ui/react'

import { IconType } from 'react-icons'
import Tooltip from '../Tooltip'

export interface IProps extends ChakraIconButtonProps {
	tooltip?: string,
	rIcon?: IconType,
	rIconSize?: string,
	placement?: 'auto-start' | 'auto' | 'auto-end' | 'top-start' | 'top' | 'top-end'
		| 'right-start' | 'right' | 'right-end' | 'bottom-start' | 'bottom' | 'bottom-end' | 'left-start' | 'left' | 'left-end'
}

const IconButton: React.FC<IProps> = forwardRef(({ tooltip, rIcon: Icon, rIconSize = '20', placement = 'top', ...rest }, ref) => (
	<Tooltip label={tooltip} placement={placement}>
		<ChakraIconButton
			ref={ref}
			variant='ghost'
			icon={Icon && <Icon size={rIconSize} />}
			{...rest}
		/>
	</Tooltip>
))

export default IconButton