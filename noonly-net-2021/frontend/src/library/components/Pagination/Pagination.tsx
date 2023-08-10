import { MdArrowBack, MdArrowForward } from 'react-icons/md'
import usePagination, { PaginationProps } from 'library/hooks/usePagination'

import { HStack } from '@chakra-ui/react'
import PaginationItem from './PaginationItem'

interface IProps extends PaginationProps {
	onPageChange: (page: number) => void,
	alwaysVisible?: boolean
}

const Pagination: React.FC<IProps> = (props) => {
	const { onPageChange, totalCount, currentPage, pageSize, alwaysVisible = false } = props

	const paginationRange = usePagination({
		currentPage,
		totalCount,
		pageSize
	})

	if ((currentPage === 0 || paginationRange.length < 2) && !alwaysVisible)
		return null

	const onNext = () => onPageChange(currentPage + 1)
	const onPrevious = () => onPageChange(currentPage - 1)

	const lastPage = paginationRange[paginationRange.length - 1]
	return (
		<HStack spacing={1}>
			<PaginationItem
				icon={MdArrowBack}
				onClick={onPrevious}
				disabled={currentPage === 1}
			/>
			{paginationRange.map((pageNumber) => (
				<PaginationItem
					active={currentPage === pageNumber}
					key={pageNumber}
					onClick={() => onPageChange(pageNumber)}
				>
					{pageNumber}
				</PaginationItem>
			)
			)}
			<PaginationItem
				icon={MdArrowForward}
				onClick={onNext}
				disabled={currentPage === lastPage}
			/>
		</HStack>
	)
}

export default Pagination