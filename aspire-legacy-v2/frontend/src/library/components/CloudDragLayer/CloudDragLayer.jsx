import { Card, CardHeader, makeStyles } from '@material-ui/core'
import { Folder, OpenWith } from '@material-ui/icons'
import { DragLayer as dragLayer } from 'react-dnd'
import { connect } from 'react-redux'

import getIcoFromName from 'library/utilities/getIcoFromName'

function getItemStyles(currentOffset) {
	if (!currentOffset) return { display: 'none' }
	const { x, y } = currentOffset
	const transform = `translate(${x}px, ${y}px)`

	return {
		WebkitTransform: transform,
		pointerEvents: 'none',
		position: 'fixed',
		transform,
		left: 0,
		top: 0
	}
}

const useStyles = makeStyles((theme) => ({
	avatar: {
		display: 'flex',
		alignItems: 'center'
	}
}))

function CloudDragLayer({ isDragging, currentOffset, item, selection }) {
	const classes = useStyles()
	if (!isDragging)
		return null

	const iconURL = getIcoFromName(item?.name)
	const avatar = item?.type === 'file' ? <img style={{ height: 24, width: 24 }} alt='' src={iconURL} /> : <Folder fontSize='small' />

	if (['file', 'folder'].includes(item?.type)) {
		return (
			<Card style={{ ...getItemStyles(currentOffset), zIndex: 999999999, maxWidth: 200 }}>
				{selection.length > 0
					? <CardHeader
						avatar={ <OpenWith /> }
						classes={{ avatar: classes.avatar }}
						title={`Move ${selection.length} Item${selection.length > 1 ? 's' : ''}`}
					/>
					: <CardHeader
						avatar={avatar}
						classes={{ avatar: classes.avatar }}
						title={`${item?.name.slice(0, 15)}${item?.name.length > 15 ? '...' : ''}`}
					/>
				}
			</Card>
		)
	} else {
		return null
	}
}


let updates = 0
let lastState = false
function collect(monitor) {
	const item = monitor.getItem()
	const isDragging = monitor.isDragging()
	updates += 1
	if (updates % 10 === 0 || (item && item.isMobile) || isDragging !== lastState) {
		lastState = isDragging
		return {
			currentOffset: monitor.getClientOffset(),
			isDragging: monitor.isDragging(),
			itemType: monitor.getItemType(),
			item: monitor.getItem()
		}
	} else {
		return {}
	}
}

const mapState = (state) => ({
	selection: state.selection.cloud
})
const mapDispatch = (dispatch) => ({})
export default connect(mapState, mapDispatch)(dragLayer(collect)(CloudDragLayer))