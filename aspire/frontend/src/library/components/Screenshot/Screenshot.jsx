import { Card, CardActionArea, CardContent, CardMedia, fade, makeStyles, Typography } from '@material-ui/core'
import { Star, StarOutline } from '@material-ui/icons'
import { useContext, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import GIFrame from 'giframe'
import dayjs from 'dayjs'

import IconButton from 'library/components/IconButton'
import UserContext from 'library/contexts/UserContext'

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

function Screenshot({ screenshot, selected, selection, setFavorite, toggleSelection, openContextMenu, openBackdrop }) {
	const { id, name, createdAt, favorite } = screenshot
	const classes = useStyles({ selected })
	const [preview, setPreview] = useState(false)
	const user = useContext(UserContext)
	const imageUrl = `https://aspire.icu/ss/${user.username}/${name}`
	const [previewImage, setPreviewImage] = useState(imageUrl)
	const timeoutRef = useRef(null)

	useEffect(() => {
		if (name.includes('.gif')) {
			setPreview(true)
			const giframe = new GIFrame()
			giframe.getBase64().then((base64) => {
				setPreviewImage(base64)
			})
			fetch(imageUrl).then((res) => res.arrayBuffer()).then((buf) => giframe.feed(new Uint8Array(buf)))
		}
	}, [name, imageUrl])

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
				onMouseOver={() => {
					if (!name.includes('.gif')) return
					timeoutRef.current = setTimeout(() => {
						setPreview(false)
					}, 250)
				}}
				onMouseOut={() => {
					clearTimeout(timeoutRef.current)
					if (!name.includes('.gif')) return
					setPreview(true)
				}}
				onDoubleClick={(e) => {
					if (e.ctrlKey) return
					openBackdrop({
						id: 1,
						payload: imageUrl
					})
				}}
			>
				<CardMedia
					className={classes.media}
					image={preview ? previewImage : imageUrl}
				/>
			</CardActionArea>
			<CardContent className={classes.content}>
				<Typography
					variant='body2'
					color='textSecondary'
					component='p'
				>
					{ dayjs(Number(createdAt)).format('MMM DD[,] YYYY [at] HH:mm') }
				</Typography>
				<IconButton
					className={classes.action}
					onClick={() => {
						setFavorite({
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
	setFavorite: dispatch.screenshots.setFavorite,
	toggleSelection: dispatch.selection.toggleScreenshotSelection,
	openContextMenu: dispatch.contextMenu.open,
	openBackdrop: dispatch.backdrop.open,
	setSelection: dispatch.selection.setScreenshotSelection
})
export default connect(mapState, mapDispatch)(Screenshot)