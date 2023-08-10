import { Card, CardActionArea, CardHeader, CardMedia, fade, Hidden, makeStyles, Tooltip, Typography, useMediaQuery } from '@material-ui/core'
import { MoreVert } from '@material-ui/icons'
import { useDispatch } from 'react-redux'
import { useDrag } from 'react-dnd'
import { useRef } from 'react'

import getIcoFromName from 'library/utilities/getIcoFromName'
import IconButton from 'library/components/IconButton'

const useStyles = makeStyles((theme) => ({
	card: {
		backgroundColor: (props) => props.isSelected && fade(theme.palette.common.white, 0.2)
	},
	media: {
		height: 150
	},
	mediaImg: {
		margin: theme.spacing(1, 0, 0, 0),
		pointerEvents: 'none',
		objectFit: 'contain'
	},
	avatar: {
		pointerEvents: 'none',
		height: 24,
		width: 24
	},
	title: {
		fontSize: 20,
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		marginRight: -theme.spacing(1)
	},
	action: {
		marginBottom: -theme.spacing(1),
		marginRight: -theme.spacing(1)
	},
	content: {
		overflow: 'hidden'
	}
}))

function CloudFile({ file, isSelected }) {
	const classes = useStyles({ isSelected })
	const dispatch = useDispatch()
	const iconURL = getIcoFromName(file.name)
	const moreVertButtonRef = useRef()
	const isMobile = useMediaQuery((theme) => theme.breakpoints.down('xs'))

	const [{ isDragging }, drag, preview] = useDrag({
		type: 'file',
		item: { ...file, isMobile },
		collect: (monitor) => ({
			isDragging: monitor.isDragging()
		})
	})

	const onClick = (e) => {
		if (!e.ctrlKey) return
		dispatch.selection.toggleCloudSelection(file.id)
	}

	const onContextMenu = (e) => {
		window.fuckoff = true
		dispatch.contextMenu.open({
			id: 7,
			cursors: {
				x: e.clientX,
				y: e.clientY
			},
			item: file
		})
		setTimeout(() => {
			window.fuckoff = false
		}, 100)
	}

	const onContextMenuClick = (e) => {
		window.fuckoff = true
		dispatch.contextMenu.open({
			id: 7,
			anchor: moreVertButtonRef.current,
			item: file
		})
		setTimeout(() => {
			window.fuckoff = false
		}, 100)
	}

	return (<>
		<div style={{ display: 'none' }} ref={preview} />
		<Card
			onContextMenu={onContextMenu}
			onClick={onClick}
			className={classes.card}
			ref={drag}
			style={{
				opacity: isDragging ? 0.4 : 1
			}}
		>
			<CardActionArea>
				<Hidden xsDown>
					<CardMedia
						className={classes.media}
						component='img'
						classes={{ img: classes.mediaImg }}
						image={iconURL}
					/>
				</Hidden>
				<CardHeader
					classes={{ content: classes.content, action: classes.action }}
					avatar={ <img className={classes.avatar} alt='' src={iconURL} /> }
					action={ <IconButton icon={MoreVert} buttonRef={moreVertButtonRef} onClick={onContextMenuClick} /> }
					title={
						<Tooltip title={file.name} enterDelay={500}>
							<Typography className={classes.title} variant='body2'>{file.name}</Typography>
						</Tooltip>
					}
				/>
			</CardActionArea>
		</Card>
	</>)
}

export default CloudFile