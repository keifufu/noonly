import { Card, CardActionArea, CardContent, CardMedia, fade, makeStyles, Typography } from '@material-ui/core'
import { Star, StarOutline } from '@material-ui/icons'
import { connect } from 'react-redux'
import dayjs from 'dayjs'

import IconButton from 'library/components/IconButton'

const useStyles = makeStyles((theme) => ({
	card: {
		backgroundColor: (props) => props.selected && fade(theme.palette.info.light, 0.1)
	},
	media: {
		filter: (props) => props.selected && 'grayscale(50%) brightness(.7)',
		paddingTop: '56.25%', // 16:9
		height: 0
	},
	content: {
		marginBottom: -theme.spacing(2.5),
		justifyContent: 'space-between',
		display: 'flex',
		padding: 0,
		paddingTop: theme.spacing(0.5),
		paddingLeft: theme.spacing(1),
		paddingRight: theme.spacing(0.5),
		alignItems: 'center'
	},
	action: {
		float: 'right',
		padding: 0
	}
}))

function Screenshot({ screenshot, selected, selection, editFavorite, toggleSelection, openContextMenu, openBackdrop }) {
	const { id, name, createdAt, favorite } = screenshot
	const classes = useStyles({ selected })
	const previewImageUrl = `https://img.${process.env.REACT_APP_HOSTNAME}/preview_${name}`

	return (
		<Card
			onClick={(e) => {
				if (!e.ctrlKey) return
				toggleSelection(id)
			}}
			onContextMenu={(e) => {
				if (selection.length > 0 && !selection.includes(id))
					toggleSelection(id)
				openContextMenu({
					id: 4,
					cursors: {
						x: e.clientX,
						y: e.clientY
					},
					item: screenshot
				})
			}}
			className={classes.card}
		>
			<CardActionArea
				onDoubleClick={(e) => {
					if (e.ctrlKey) return
					openBackdrop({
						id: 1,
						payload: previewImageUrl.replace('preview_', '')
					})
				}}
			>
				<CardMedia
					className={classes.media}
					image={previewImageUrl}
				/>
			</CardActionArea>
			<CardContent className={classes.content}>
				<Typography
					variant='body2'
					color='textSecondary'
					component='p'
				>
					{ dayjs(createdAt).format('MMM DD[,] YYYY [at] HH:mm') }
				</Typography>
				<IconButton
					className={classes.action}
					onClick={() => {
						editFavorite({
							ids: [id],
							favorite: !favorite
						})
					}}
					icon={ favorite ? Star : StarOutline }
					tooltip={ favorite ? 'Remove from Favorites' : 'Add to Favorites' }
					size={38}
				/>
			</CardContent>
		</Card>
	)
}


const mapState = (state) => ({
	selection: state.selection.screenshots
})
const mapDispatch = (dispatch) => ({
	editFavorite: dispatch.screenshots.editFavorite,
	toggleSelection: dispatch.selection.toggleScreenshotSelection,
	openContextMenu: dispatch.contextMenu.open,
	openBackdrop: dispatch.backdrop.open,
	setSelection: dispatch.selection.setScreenshotSelection
})
export default connect(mapState, mapDispatch)(Screenshot)