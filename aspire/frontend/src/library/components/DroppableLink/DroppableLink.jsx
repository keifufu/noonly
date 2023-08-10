import { useHistory } from 'react-router'
import { Link } from '@material-ui/core'
import { connect } from 'react-redux'
import { useDrop } from 'react-dnd'

function DroppableLink({ name, parent_id, currentParentId, routeTo, selection, setParentId }) {
	const history = useHistory()

	const [{ isOver }, drop] = useDrop({
		accept: ['file', 'folder'],
		drop: (droppedItem) => {
			const ids = selection.length > 0 ? selection : [droppedItem.id]
			setParentId({
				ids,
				currentParentId,
				parent_id: parent_id
			})
		},
		canDrop: (item) => {
			if (item?.name === name) return false
			else return true
		},
		collect: (monitor) => ({
			isOver: monitor.isOver()
		})
	})

	const onClick = () => {
		history.push(routeTo)
	}

	return (
		<Link
			ref={drop}
			style={{
				cursor: 'pointer',
				color: isOver && 'white'
			}}
			color='inherit'
			onClick={onClick}
		>
			{name}
		</Link>
	)
}

const mapState = (state) => ({
	selection: state.selection.cloud
})
const mapDispatch = (dispatch) => ({
	setParentId: dispatch.cloud.setParentId
})
export default connect(mapState, mapDispatch)(DroppableLink)