import { Card, CardHeader } from '@material-ui/core'
import { Folder, OpenWith } from '@material-ui/icons'
import { getIcoFromName } from '../../Utilities'
import React, { Component } from 'react'
import { DragLayer } from 'react-dnd'

function getItemStyles(props) {
	const { currentOffset } = props
	if(!currentOffset) return { display: 'none' }
	let { x, y } = currentOffset
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

class CustomDragLayer extends Component {
	render() {
		const isDragging = this.props.isDragging
		if(!isDragging) return null

		const { item, data } = this.props
		const { selected } = data
		const iconURL = getIcoFromName(item.name)
		const avatar = item.type === 'file' ? <img style={{ height: 24, width: 24 }} alt='' src={iconURL} /> : <Folder fontSize='small' />
		const length = selected.length

		if(['folder', 'file'].includes(item.type)) {
			return (
				<Card style={{ ...getItemStyles(this.props), zIndex: 99999, maxWidth: 200 }}>
					{length > 0 ? (
						<CardHeader
							avatar={<OpenWith />}
							title={`Move ${length} Item${length === 1 ? '' : 's'}`}
						/>
					) : (
						<CardHeader
							avatar={avatar}
							title={`${item.name?.slice(0, 15)}${item.name?.length > 15 ? '...' : ''}`}
						/>
					)}
				</Card>
			)
		} else return null
	}
}

let updates = 0
let lastState = false
function collect(monitor) {
	const item = monitor.getItem()
	const isDragging = monitor.isDragging()
	if(updates++ % 10 === 0 || (item && item.mobile) || isDragging !== lastState) {
		lastState = isDragging
		return {
			currentOffset: monitor.getClientOffset(),
			isDragging: monitor.isDragging(),
			itemType: monitor.getItemType(),
			item: monitor.getItem()
		}
	} else return {}
}

export default DragLayer(collect)(CustomDragLayer)