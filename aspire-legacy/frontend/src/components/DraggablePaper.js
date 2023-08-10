import { Paper } from '@material-ui/core'
import Draggable from 'react-draggable'

export default function DraggablePaper(props) {
	return (
		<Draggable handle='#draggable-title' cancel={'[class*="MuiDialogContent-root"]'}>
			<Paper {...props} />
		</Draggable>
	)
}