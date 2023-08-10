import { fade, Link, Typography, withStyles } from '@material-ui/core'
import { addMetadata } from '../../../redux'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Api from '../../../Api'

export class LinkEmbed extends Component {
	render() {
		const { classes, metadata, url } = this.props
		const data = metadata[url]
		if(!data || Object.keys(data).length === 1) return null

		const parsedUrl = new URL(url)

		let isImage = false
		let isVideo = false
		const imageExt = ['.jpg', '.jpeg', '.png', '.gif']
		imageExt.forEach(ext => {
			if(parsedUrl.pathname.endsWith(ext)) isImage = true
		})
		const videoExt = ['.mp4', '.webm']
		videoExt.forEach(ext => {
			if(parsedUrl.pathname.endsWith(ext)) isVideo = true
		})

		const overwriteStyle = {
			backgroundColor: (isImage || isVideo) && 'transparent',
			padding: (isImage || isVideo) && 0
		}

		return (
			<div className={classes.root} style={overwriteStyle}>
				{isImage ? (<>
					<img src={data.url} alt='' />
				</>) : isVideo ? (<>
					<video src={data.url} alt='' />
				</>) : (<>
					<div className={classes.content}>
						<Typography variant='body2' color='textSecondary' className={classes.publisher}>{data.publisher}</Typography>
						<Link variant='body1' href={url} className={classes.title}>{data.title}</Link>
						<Typography variant='inherit' color='textSecondary' className={classes.description}>{data.description}</Typography>
					</div>
					{(data.logo || data.image) && (
						<div className={classes.logo}>
							<img src={data.logo ? data.logo : data.image} className={classes.img} alt='' />
						</div>
					)}
				</>)}
			</div>
		)
	}

	componentDidMount = () => {
		if(this.props.metadata[this.props.url]) return
		Api.metadata(this.props.url).then(res => {
			this.props.addMetadata({ ...res, url: this.props.url })
			this.props.scrollToBottom()
		}).catch(err => {
			this.props.addMetadata({ url: this.props.url })
			this.props.scrollToBottom()
		})
	}
}

const styles = theme => ({
	root: {
		padding: theme.spacing(2),
		marginBottom: theme.spacing(0.5),
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.black, 0.1),
		justifyContent: 'space-between',
		marginLeft: theme.spacing(0.1),
		display: 'flex',
		width: 550
	},
	title: {
		display: 'block',
		fontWeight: 'bold'
	},
	logo: {
		display: 'flex',
		flex: '0 0 auto'
	},
	img: {
		height: 64,
		width: 64,
		borderRadius: 6
	},
	description: {
		paddingRight: theme.spacing(1),
		whiteSpace: 'pre-wrap'
	},
	publisher: {

	}
})


const mapStateToProps = state => ({ metadata: state.generic.metadata })
const mapDispatchToProps = dispatch => ({
	addMetadata: value => dispatch(addMetadata(value))
})
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(LinkEmbed))