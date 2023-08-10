import IconButton, { IconButtonProps } from 'library/components/IconButton'

import { Circle } from '@chakra-ui/react'
import { IconType } from 'react-icons'
import Invisible from 'library/components/Invisible'
import { memo } from 'react'

interface IProps extends IconButtonProps {
	rIcon: IconType,
	alert?: boolean,
	showDot?: boolean
}

const MailToolbarButton: React.FC<IProps> = memo(({ rIcon: Icon, alert = false, showDot = false, ...rest }) => (
	<IconButton
		icon={(
			<div>
				<Icon size='20' />
				<Invisible visible={showDot}>
					<Circle size='2' bg='blue.400' position='absolute' top={1} right={1} />
				</Invisible>
			</div>
		)}
		variant='ghost'
		color={alert ? 'red.500' : undefined}
		{...rest}
	/>
))

export default MailToolbarButton