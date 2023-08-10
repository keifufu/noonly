import { Card, CardActionArea, CardHeader, IconButton, makeStyles, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core'
import { Folder, MoreVert } from '@material-ui/icons'
import { useDrag, useDrop } from 'react-dnd'
import React from 'react'
import clsx from 'clsx'

const useStyles = makeStyles(theme => ({
	card: {
		backgroundColor: props => props.isSelected ? theme.palette.grey[theme.palette.type === 'dark' ? '800' : '300'] : ''
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
	action: {
		marginBottom: -8,
		marginRight: -8
	},
	content: {
		overflow: 'hidden'
	}
}))

function CloudFolderCard(props) {
	const { location, selected, onDoubleClick, openMenu, folder, moveCopyItem, onClick, onContextMenu } = props
	const mobile = useMediaQuery(useTheme().breakpoints.down('xs'))
	const classes = useStyles(props)
	const { name, path } = folder

	const [{ isDragging }, drag, preview] = useDrag({
		item: { type: 'folder', name, path, mobile },
		collect: monitor => ({
			isDragging: monitor.isDragging()
		})
	})

	const [{ isOver }, drop] = useDrop({
		accept: ['file', 'folder'],
		drop: droppedItem => {
			let path = decodeURIComponent(document.location.pathname).replace(`/cloud/${location === 'user' ? 'u' : location}`, '')
			if(!path.startsWith('/')) path = `/${path}`
			if(path !== '/' && path.endsWith('/')) path = path.slice(0, -1)
			const item = { path: droppedItem.path, newPath: `${path}/${name}/${droppedItem.name}`, location: location, newLocation: location }
			const undoItem = { path: item.newPath, newPath: item.path, location: item.newLocation, newLocation: item.location }
			const itemArray = selected.map(item => { return { path: item.path, newPath: `${path}/${name}/${item.name}`, location: location, newLocation: location } })
			const undoArray = itemArray.map(item => { return { path: item.newPath, newPath: item.path, location: item.newLocation, newLocation: item.location } })
			moveCopyItem('rename', item, undoItem, itemArray, undoArray, selected)
		},
		canDrop: item => {
			if(item?.name === name) return false
			else return true
		},
		collect: monitor => ({
			isOver: monitor.isOver()
		})
	})

	const cardClassName = clsx(classes.card, isOver && classes.cardDrop)
	return (<>
		<div style={{ display: 'none' }} ref={preview} />
		<div ref={drag}>
			<Card onClick={onClick} onContextMenu={onContextMenu} ref={drop} className={cardClassName} style={{ opacity: isDragging ? 0.4 : 1 }} onDoubleClick={onDoubleClick}>
				<CardActionArea>
					<CardHeader
						classes={{ content: classes.content, action: classes.action }}
						avatar={ <Folder/> }
						action={
							<IconButton onClick={e => openMenu(folder, e)}>
								<MoreVert />
							</IconButton>
						}
						title={<Tooltip title={name} enterDelay={500}><Typography className={classes.title} variant='body2'>{name}</Typography></Tooltip>}
					/>
				</CardActionArea>
			</Card>
		</div>
	</>)
}

export default CloudFolderCard