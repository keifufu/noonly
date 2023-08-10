import { Card, CardActionArea, CardContent, CardMedia, IconButton, Typography, withStyles } from '@material-ui/core'
import { Star, StarOutline } from '@material-ui/icons'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import GIFrame from 'giframe'
import moment from 'moment'
import Api from '../../Api'

class ScreenshotCard extends Component {
	constructor(props) {
		super(props)
		this.state = {
			image: 'https://aspire.icu',
			previewImage: 'https://aspire.icu',
			preview: false
		}
	}
	
	render() {
		const { classes, onDoubleClick, onClick, onContextMenu, item } = this.props
		const { toggleFavorite, onMouseOver, onMouseOut } = this
		const { image, preview, previewImage } = this.state
		const { created, favorite } = item

		return (
			<Card onClick={onClick} onContextMenu={onContextMenu} className={classes.card}>
				<CardActionArea onMouseOver={onMouseOver} onMouseOut={onMouseOut} onDoubleClick={onDoubleClick}>
					<CardMedia className={classes.media} image={preview ? previewImage : image} />
				</CardActionArea>
				<CardContent className={classes.content}>
					<Typography variant='body2' color='textSecondary' component='p'>
						{ moment.unix(created).format('MMM DD[,] YYYY [at] hh:mm') }
					</Typography>
					<IconButton className={classes.star} onClick={toggleFavorite}>
						{ favorite === 'true' ? <Star /> : <StarOutline /> }
					</IconButton>
				</CardContent>
			</Card>
		)
	}

	componentDidMount = () => {
		const { item } = this.props
		let state = { image: `https://aspire.icu/ss/${item.account_username}/${item.name}` }
		if(item.name.includes('.gif')) {
			state['preview'] = true
			const giframe = new GIFrame()
			giframe.getBase64().then(base64 => {
				this.setState({ previewImage: base64 })
			})
			fetch(state.image).then(res => res.arrayBuffer()).then(buf => giframe.feed(new Uint8Array(buf)))
		}
		this.setState(state)
	}

	onMouseOver = () => {
		if(!this.props.item.name.includes('.gif')) return
		this.timeout = setTimeout(() => {
			this.setState({ preview: false })
		}, 250)
	}

	onMouseOut = () => {
		clearTimeout(this.timeout)
		if(!this.props.item.name.includes('.gif')) return
		this.setState({ preview: true })
	}

	toggleFavorite = () =>  {
		const { enqueueSnackbar, item, getState, setState } = this.props
		const newFavorite = item.favorite === 'true' ? 'false' : 'true'
		Api.screenshots.setFavorite(item, newFavorite).then(res => {
			const { data } = getState()
			data[data.indexOf(item)].favorite = newFavorite
			setState({ data })
			enqueueSnackbar(res, { variant: 'success' })
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
		})
	}
}

const styles = theme => ({
	card: {
		backgroundColor: props => props.isSelected ? theme.palette.grey[theme.palette.type === 'dark' ? '800' : '300'] : ''
	},
	media: {
		paddingTop: '56.25%', // 16:9
		height: 0,
	},
	content: {
		marginBottom: -theme.spacing(1.5),
		justifyContent: 'space-between',
		display: 'flex',
	},
	star: {
		float: 'right',
		padding: 0
	}
})

export default withStyles(styles, { withTheme: true })(withSnackbar(ScreenshotCard))