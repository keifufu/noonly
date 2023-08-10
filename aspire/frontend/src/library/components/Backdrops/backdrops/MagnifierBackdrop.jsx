import { Backdrop } from '@material-ui/core'
import { useDispatch } from 'react-redux'

import ImageMagnifier from 'library/components/ImageMagnifier'

function MagnifierBackdrop({ open, payload }) {
	const dispatch = useDispatch()
	return (
		<Backdrop open={open} style={{ zIndex: 999999 }}>
			<ImageMagnifier image={payload} onClose={dispatch.backdrop.close} />
		</Backdrop>
	)
}


export default MagnifierBackdrop