import { Skeleton } from '@chakra-ui/react'

const ScreenshotCardSkeleton: React.FC = () => (
	<Skeleton
		maxWidth='sm'
		py={{ base: '16', md: '140px' }}
		rounded='lg'
	/>
)

export default ScreenshotCardSkeleton