import { Box, Fade, Img, useOutsideClick } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

import { OverlayProps } from '../Overlays'
import imgHost from 'library/utilities/imgHost'

const ScreenshotOverlay: React.FC<OverlayProps> = ({ id, overlay }) => {
	const isOpen = overlay.id === id
	const screenshot: Noonly.API.Data.Screenshot = overlay.data
	const imgRef = useRef<null | HTMLImageElement>(null)

	useOutsideClick({
		ref: imgRef,
		handler: overlay.onClose ? overlay.onClose : () => null
	})

	useEffect(() => {
		if (window.getSelection()?.empty)
			window.getSelection()?.empty()
		else if (window.getSelection()?.removeAllRanges) // Compatibility
			window.getSelection()?.removeAllRanges()
	}, [isOpen])

	return (
		<Fade
			in={isOpen}
			unmountOnExit
		>
			<Box
				position='absolute'
				top={0}
				left={0}
				height='100vh'
				width='100vw'
				alignItems='center'
				justifyContent='center'
				display='flex'
				bg='rgba(0,0,0,0.7)'
			>
				<Img
					cursor='default'
					ref={imgRef}
					maxH='85vh'
					maxW='85vw'
					rounded='lg'
					objectFit='contain'
					src={`${imgHost}/r/${screenshot.name}`}
					alt={screenshot.name}
				/>
			</Box>
		</Fade>
	)
}

export default ScreenshotOverlay