import { Skeleton } from '@chakra-ui/react'

const FileCardSkeleton: React.FC = () => {
	const widths = [16, 20, 24]
	const randomWidth = widths[Math.floor(Math.random() * widths.length)]
	return (
		<Skeleton
			py='8'
			px={randomWidth}
			rounded={{ sm: 'lg' }}
		/>
	)
}

export default FileCardSkeleton