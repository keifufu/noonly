import { DialogContentText } from '@material-ui/core'
import { connect } from 'react-redux'
import dayjs from 'dayjs'

import humanFileSize from 'library/utilities/humanFileSize'
import Dialog from 'library/components/Dialog'

function ScreenshotDetailsDialog({ id, dialog, closeDialog }) {
	const { open, payload: screenshot } = dialog
	const { name, type, width, height, size, createdAt, favorite, trash } = screenshot || {}

	const details
	= `	Name: ${name}
		Type: ${type}
		Dimensions: ${width}px x ${height}px
		Size: ${humanFileSize(size)}
		Created: ${dayjs(Number(createdAt)).format('MMM DD[,] YYYY [at] HH:mm')}
		Favorite: ${favorite === 'true'}
		Trash: ${trash === 'true'}
	`

	return (
		<Dialog
			open={open === id}
			title='Screenshot Details'
			onClose={closeDialog}
		>
			<DialogContentText style={{ marginLeft: 14, whiteSpace: 'pre-line' }}>
				{details}
			</DialogContentText>
		</Dialog>
	)
}

const mapState = (state) => ({
	dialog: state.dialog
})
const mapDispatch = (dispatch) => ({
	closeDialog: dispatch.dialog.close
})
export default connect(mapState, mapDispatch)(ScreenshotDetailsDialog)