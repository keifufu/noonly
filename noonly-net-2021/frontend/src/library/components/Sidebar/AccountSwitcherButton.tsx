import { Box, Flex, HStack, Img, Skeleton, forwardRef } from '@chakra-ui/react'
import { memo, useState } from 'react'

import { HiSelector } from 'react-icons/hi'
import { MdPerson } from 'react-icons/md'
import { RootState } from 'main/store/store'
import imgHost from 'library/utilities/imgHost'
import { useSelector } from 'react-redux'

interface IProps {
	showBlue: boolean,
	onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const AccountSwitcherButton: React.FC<IProps> = memo(forwardRef(({ showBlue, onClick }, ref) => {
	const user = useSelector((state: RootState) => state.user)
	const [avatarLoaded, setAvatarLoaded] = useState(false)

	return (
		<Flex
			as='button'
			w='full'
			display='flex'
			alignItems='center'
			rounded='lg'
			bg='gray.700'
			px='3'
			py='2'
			fontSize='sm'
			userSelect='none'
			cursor='pointer'
			outline='0'
			transition='all 0.2s'
			_active={{ bg: 'gray.600' }}
			_focus={{ shadow: 'outline' }}
			ref={ref}
			onClick={onClick}
		>
			<HStack flex='1' spacing='3'>
				{
					user.avatar ? (
						<Skeleton w='8' h='8' rounded='md' isLoaded={avatarLoaded}>
							<Img
								w='8'
								h='8'
								rounded='md'
								objectFit='cover'
								src={`${imgHost}/avatar/${user.avatar}`}
								alt={user.username}
								onLoad={() => setAvatarLoaded(true)}
							/>
						</Skeleton>
					) : (
						<Box
							w='8'
							h='8'
							rounded='md'
							as={MdPerson}
						/>
					)
				}
				<Box textAlign='start'>
					<Box isTruncated fontWeight='semibold'>
						{ user.username }
					</Box>
					<Box fontSize='xs' color='gray.400'>
						{ user.status }
					</Box>
				</Box>
			</HStack>
			<Box fontSize='lg' color='gray.400'>
				{/* #4299e1 = blue.400 */}
				<HiSelector color={showBlue ? '#4299e1' : undefined} />
			</Box>
		</Flex>
	)
}))

export default AccountSwitcherButton