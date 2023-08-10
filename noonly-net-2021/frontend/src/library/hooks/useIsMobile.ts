import { useMediaQuery } from '@chakra-ui/react'

const useIsMobile = (applyOnExtension = true): boolean => {
	const [isMobile] = useMediaQuery('(max-width: 30em)')
	const isExtension = process.env.REACT_APP_IS_EXTENSION === 'true'

	return (!applyOnExtension && isExtension) ? false : isMobile
}

export default useIsMobile