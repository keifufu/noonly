import { Card, CardActionArea, CardHeader, fade, makeStyles, Tooltip, Typography, useMediaQuery } from '@material-ui/core'
import { useHistory, useLocation } from 'react-router'
import { Folder, MoreVert } from '@material-ui/icons'
import { useDrag, useDrop } from 'react-dnd'
import { connect } from 'react-redux'
import { useRef } from 'react'
import clsx from 'clsx'

import IconButton from 'library/components/IconButton'

const useStyles = makeStyles((theme) => ({
	card: {
		backgroundColor: (props) => props.isSelected && fade(theme.palette.common.white, 0.2)
	},
	cardDrop: {
		backgroundColor: theme.palette.grey[theme.palette.type === 'dark' ? '700' : '200']
	},
	title: {
		fontSize: 20,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		marginRight: -theme.spacing(1)
	},
	avatar: {
		display: 'flex',
		alignItems: 'center'
	},
	action: {
		marginBottom: -theme.spacing(1),
		marginRight: -theme.spacing(1)
	},
	content: {
		overflow: 'hidden'
	}
}))

function CloudFolder({ folder, currentParentId, selection, toggleSelection, openContextMenu, setParentId }) {
	const classes = useStyles({ isSelected: selection.includes(folder.id) })
	const location = useLocation()
	const history = useHistory()
	const moreVertButtonRef = useRef()
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))

	const [{ isDragging }, drag, preview] = useDrag({
		type: 'folder',
		item: { ...folder, isMobile },
		collect: (monitor) => ({
			isDragging: monitor.isDragging()
		})
	})

	const [{ isOver }, drop] = useDrop({
		accept: ['file', 'folder'],
		drop: (droppedItem) => {
			const ids = selection.length > 0 ? selection : [droppedItem.id]
			setParentId({
				ids,
				currentParentId,
				parent_id: folder.id
			})
		},
		canDrop: (item) => {
			if (item?.name === folder.name) return false
			else return true
		},
		collect: (monitor) => ({
			isOver: monitor.isOver()
		})
	})

	const onDoubleClick = () => {
		let newLocation = `/cloud/${folder.id}`
		const trash = location.pathname.includes('/cloud/trash')
		if (trash) newLocation = `/cloud/trash/${folder.id}`
		history.push(newLocation)
	}

	const onClick = (e) => {
		if (e.ctrlKey)
			toggleSelection(folder.id)
		if (isMobile)
			onDoubleClick()
	}

	const onContextMenu = (e) => {
		window.fuckoff = true
		openContextMenu({
			id: 7,
			cursors: {
				x: e.clientX,
				y: e.clientY
			},
			item: folder
		})
		setTimeout(() => {
			window.fuckoff = false
		}, 100)
	}

	const onContextMenuClick = (e) => {
		window.fuckoff = true
		openContextMenu({
			id: 7,
			anchor: moreVertButtonRef.current,
			item: folder
		})
		setTimeout(() => {
			window.fuckoff = false
		}, 100)
	}

	const cardClassName = clsx(classes.card, isOver && classes.cardDrop)
	return (<>
		<div style={{ display: 'none' }} ref={preview} />
		<div ref={drop}>
			<Card
				onContextMenu={onContextMenu}
				onDoubleClick={onDoubleClick}
				onClick={onClick}
				className={cardClassName}
				ref={drag}
				style={{
					opacity: isDragging ? 0.4 : 1
				}}
			>
				<CardActionArea component='div'>
					<CardHeader
						classes={{ avatar: classes.avatar, content: classes.content, action: classes.action }}
						avatar={ <Folder /> }
						action={ <IconButton icon={MoreVert} buttonRef={moreVertButtonRef} onClick={onContextMenuClick} /> }
						title={
							<Tooltip title={folder.name} enterDelay={500}>
								<Typography className={classes.title} variant='body2'>{folder.name}</Typography>
							</Tooltip>
						}
					/>
				</CardActionArea>
			</Card>
		</div>
	</>)
}

const mapState = (state) => ({
	selection: state.selection.cloud
})
const mapDispatch = (dispatch) => ({
	toggleSelection: dispatch.selection.toggleCloudSelection,
	openContextMenu: dispatch.contextMenu.open,
	setParentId: dispatch.cloud.setParentId
})
export default connect(mapState, mapDispatch)(CloudFolder)