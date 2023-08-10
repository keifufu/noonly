import { Button, ButtonProps } from '@chakra-ui/react'

import IconButton from 'library/components/IconButton'
import { IconType } from 'react-icons'

interface IProps extends ButtonProps {
	active?: boolean,
	icon?: IconType,
}

const PaginationItem: React.FC<IProps> = ({ active, icon, ...props }) => {
	if (icon) {
		return (
			<IconButton
				aria-label='button'
				size='sm'
				bg='gray.600'
				_hover={{ bg: 'gray.500' }}
				_active={{ bg: 'gray.500' }}
				rIcon={icon}
				{...props}
			/>
		)
	} else {
		return (
			<Button
				size='sm'
				_hover={{ bg: 'gray.500' }}
				_active={{ bg: 'gray.500' }}
				bg={active ? 'gray.500' : 'gray.600'}
				{...props}
			/>
		)
	}
}

export default PaginationItem