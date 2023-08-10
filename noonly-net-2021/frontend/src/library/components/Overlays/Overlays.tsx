import { Box, Portal } from '@chakra-ui/react'

import { RootState } from 'main/store/store'
import ScreenshotOverlay from './overlays/ScreenshotOverlay'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

export interface OverlayProps {
	id: number,
	overlay: Noonly.State.Overlay
}

const Overlays: React.FC = () => {
	const overlay = useSelector((state: RootState) => state.overlay)

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== 'Escape' || overlay.id === null) return
			overlay.onClose?.()
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [overlay])

	return (
		<Portal>
			<Box cursor='pointer' height='100%' position='fixed'>
				<ScreenshotOverlay id={1} overlay={overlay} />
			</Box>
		</Portal>
	)
}

export default Overlays