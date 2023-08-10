import { Card, CardActionArea, CardHeader, CardMedia, Hidden, IconButton, makeStyles, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core'
import { getIcoFromName } from '../../Utilities'
import { MoreVert } from '@material-ui/icons'
import { useDrag } from 'react-dnd'
import React from 'react'

const useStyles = makeStyles(theme => ({
	card: {
		backgroundColor: props => props.isSelected ? theme.palette.grey[theme.palette.type === 'dark' ? '800' : '300'] : ''
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
		marginBottom: -8,
		marginRight: -8
	},
	content: {
		overflow: 'hidden'
	}
}))

export default function CloudFileCard(props) {
	const { name, path } = props.file
	const iconURL = getIcoFromName(name)
	const classes = useStyles(props)
	const { openMenu, onClick, onContextMenu, onDoubleClick } = props
	const mobile = useMediaQuery(useTheme().breakpoints.down('xs'))

	const [{ isDragging }, drag, preview] = useDrag({
		item: { type: 'file', name, path, mobile },
		collect: monitor => ({
			isDragging: monitor.isDragging()
		})
	})

	return (<>
		<div style={{ display: 'none' }} ref={preview} />
		<Card onClick={onClick} onContextMenu={onContextMenu} onDoubleClick={onDoubleClick} ref={drag} className={classes.card} style={{ opacity: isDragging ? 0.4 : 1 }}>
			<CardActionArea>
				<Hidden xsDown>
					<CardMedia className={classes.media} component='img' classes={{ img: classes.mediaImg }} image={iconURL} />
				</Hidden>
				<CardHeader
					classes={{ content: classes.content, action: classes.action }}
					avatar={ <img className={classes.avatar} alt='' src={iconURL} /> }
					action={
						<IconButton onClick={e => openMenu(props.file, e)}>
							<MoreVert />
						</IconButton>
					}
					title={<Tooltip title={name} enterDelay={500}><Typography className={classes.title} variant='body2'>{name}</Typography></Tooltip>}
				/>
			</CardActionArea>
		</Card>
	</>)
}

