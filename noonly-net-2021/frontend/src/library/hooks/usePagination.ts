import { useMemo } from 'react'

export interface PaginationProps {
	totalCount: number,
	pageSize: number,
	currentPage: number
}

/* This is such a mess, but it will do for now! */
const usePagination = (props: PaginationProps): number[] => {
	const { totalCount, pageSize, currentPage } = props

	const paginationRange = useMemo(() => {
		const totalPageCount = Math.ceil(totalCount / pageSize)

		if (currentPage === 1 && totalPageCount === 1)
			return [1]
		else if (currentPage + 1 === totalPageCount && totalPageCount === 2)
			return [currentPage, totalPageCount]
		else if (currentPage + 1 === totalPageCount && totalPageCount > 2)
			return [currentPage - 1, currentPage, totalPageCount]
		else if (currentPage === totalPageCount && totalPageCount === 2)
			return [currentPage - 1, currentPage]
		else if (currentPage === totalPageCount && totalPageCount > 2)
			return [currentPage - 2, currentPage - 1, currentPage]
		else if (currentPage === 1 && totalPageCount === 2)
			return [1, 2]
		else if (currentPage === 1 && totalPageCount > 2)
			return [1, 2, 3]
		else
			return [currentPage - 1, currentPage, currentPage + 1]
	}, [totalCount, pageSize, currentPage])

	return paginationRange
}

export default usePagination