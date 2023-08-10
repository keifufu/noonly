import { Box, BoxProps, Button, ButtonProps, IconButton, IconButtonProps, forwardRef } from '@chakra-ui/react'

import { IconType } from 'react-icons'

interface IProps {
	rIcon: IconType,
	isSecondary?: boolean,
	text?: string,
	boxProps?: BoxProps,
	colors?: {
		bg: string,
		hover: string
		active: string
	}
}

const Fab: React.FC<IProps & BoxProps & Partial<ButtonProps> & Partial<IconButtonProps>> = forwardRef(({ rIcon: Icon, isSecondary, text, boxProps, colors, ...rest }, ref) => (
	<Box
		ref={ref}
		/* Cant figure out how to use Portal here, zIndex will do for now! */
		zIndex={999}
		position='absolute'
		bottom={isSecondary ? { base: '36', md: '24' } : { base: '20', md: '7' }}
		right={{ base: '2', md: '6' }}
		{...boxProps}
	>
		{ text ? (
			<Button
				size='lg'
				_focus={{
					boxShadow: 'none'
				}}
				bg={colors?.bg || 'blue.600'}
				_hover={{ bg: colors?.hover || 'blue.500' }}
				_active={{ bg: colors?.active || 'blue.500' }}
				variant='solid'
				shadow='base'
				rounded='full'
				display='flex'
				pl='3'
				leftIcon={<Icon size='24' />}
				{...rest}
			>
				{ text }
			</Button>
		) : (
			<IconButton
				aria-label='FAB'
				_focus={{
					boxShadow: 'none'
				}}
				size='lg'
				bg={colors?.bg || 'blue.600'}
				_hover={{ bg: colors?.hover || 'blue.500' }}
				_active={{ bg: colors?.active || 'blue.500' }}
				icon={<Icon size='24' />}
				shadow='base'
				rounded='full'
				{...rest}
			/>
		)}
	</Box>
))

export default Fab