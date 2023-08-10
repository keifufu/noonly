import { Skeleton } from '@chakra-ui/react'

const MailPreviewCardSkeleton: React.FC = () => (
	<Skeleton
		py={{ base: '33px', md: '25px' }}
		rounded={{ base: '0', md: 'lg' }}
	/>
)

export default MailPreviewCardSkeleton