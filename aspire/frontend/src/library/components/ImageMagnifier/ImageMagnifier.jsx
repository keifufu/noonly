import { ClickAwayListener } from '@material-ui/core'
import Magnifier from './Magnifier'

function ImageMagnifier({ image, onClose }) {
	return (
		<ClickAwayListener onClickAway={onClose}>
			<div style={{
				maxHeight: '75vh',
				maxWidth: '75vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden'
			}}>
				<Magnifier src={image} />
			</div>
		</ClickAwayListener>
	)
}

export default ImageMagnifier