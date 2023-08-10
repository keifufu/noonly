import { Avatar, Card, CardContent, CardHeader, Grid, Hidden, IconButton, Typography, withStyles, withWidth } from '@material-ui/core'
import InboxAttachment from './InboxAttachment'
import { MoreVert, Reply, Star, StarOutline } from '@material-ui/icons'
import { withSnackbar } from 'notistack'
import React, { Component } from 'react'
import LazyLoad from 'react-lazyload'
import moment from 'moment'
import Api from '../../Api'

class InboxItemFull extends Component {
	constructor(props) {
		super(props)
		this.state = {
			images: [],
			expanded: false,
			starHover: false
		}
	}
	
	render() {
		const { classes, data } = this.props
		const { item, isResponse } = data
		const { date, subject, from: _from, text, html, attachments: _attachments, favorite } = item
		const attachments = _attachments.filter(e => !e.related)
		const { expanded, starHover } = this.state
		const { formatHTML, formatText, onStarClick } = this
		const from = { email: _from.value[0].address, name: _from.value[0].name.length > 0 ? _from.value[0].name : _from.value[0].address.split('@')[0] }

		return (
			<Card className={classes.card}>
				{!isResponse &&
				<div className={classes.subjectRoot}>
					<div className={classes.subject}>
						<Typography variant='h5'>
							{subject}
						</Typography>
					</div>
					{/* <div className={classes.action}>
						<IconButton className={classes.iconButton}>
							<MoreVert />
						</IconButton>
					</div> */}
				</div>}
				{
					expanded ? (<>
					<CardHeader
						className={classes.header}
						avatar={<Avatar />}
						title={from.name}
						titleTypographyProps={{ style: { cursor: 'pointer' }, onClick: () => this.setState({ expanded: !expanded }) }}
						subheader={from.email}
						subheaderTypographyProps={{ style: { cursor: 'pointer' }, onClick: () => this.setState({ expanded: !expanded }) }}
						style={{ paddingBottom: 0 }}
						action={<>
							<Hidden xsDown>
								<Typography variant='body2' color='textSecondary' component='span' className={classes.date}>
									{moment.unix(Date.parse(date) / 1000).format('MMM DD YYYY[,] hh:mm')} ({moment.unix(Date.parse(date) / 1000).fromNow()})
								</Typography>
								<IconButton onClick={onStarClick} onMouseOver={() => this.setState({ starHover: true })} onMouseOut={() => this.setState({ starHover: false })} className={classes.iconButton}>
										{ favorite ?
										starHover ? <StarOutline className={classes.icon} /> : <Star className={classes.icon} /> :
										starHover ? <Star className={classes.icon} /> : <StarOutline className={classes.icon} /> }
									</IconButton>
								<IconButton className={classes.iconButton}>
									<Reply className={classes.icon} />
								</IconButton>
							</Hidden>
							<IconButton className={classes.iconButton}>
								<MoreVert className={classes.icon} />
							</IconButton>
						</>}
					/>
					<CardContent className={classes.content}>
						{html.length > 0 ?
						<div dangerouslySetInnerHTML={{ __html: formatHTML(html) }} /> :
						<Typography className={classes.typography}>{text}</Typography>
					}
					</CardContent>
					{attachments.length > 0 &&
						<Grid container spacing={1} className={classes.attachmentContainer}>
							<Typography variant='h6' className={classes.attachments}>Attachments</Typography>
							{attachments.map((e, i) => (
								<Grid item xs={8} sm={2} key={i}>
									<LazyLoad>
										<InboxAttachment data={e} />
									</LazyLoad>
								</Grid>
							))}
						</Grid>}
					</>) : (<>
						<CardHeader
							className={classes.header}
							avatar={<Avatar />}
							title={from.name}
							titleTypographyProps={{ style: { cursor: 'pointer' }, noWrap: true, onClick: () => this.setState({ expanded: !expanded }) }}
							subheader={formatText(text)}
							subheaderTypographyProps={{ style: { cursor: 'pointer' }, noWrap: true, onClick: () => this.setState({ expanded: !expanded }) }}
							action={<>
								<Hidden xsDown>
									<Typography variant='body2' color='textSecondary' component='span' className={classes.date}>
										{moment.unix(Date.parse(date) / 1000).format('MMM DD YYYY[,] hh:mm')} ({moment.unix(Date.parse(date) / 1000).fromNow()})
									</Typography>
								</Hidden>
								<IconButton onClick={onStarClick} onMouseOver={() => this.setState({ starHover: true })} onMouseOut={() => this.setState({ starHover: false })} className={classes.iconButton}>
									{ favorite ?
									starHover ? <StarOutline className={classes.icon} /> : <Star className={classes.icon} /> :
									starHover ? <Star className={classes.icon} /> : <StarOutline className={classes.icon} /> }
								</IconButton>
							</>}
						/>
					</>)
				}
			</Card>
		)
	}

	componentDidMount = () => {
		this.setState({ expanded: this.props.data.item?.replies ? false : true })
		this.getImageAttachments()
		this.cleanupHTML()
	}

	componentDidUpdate = prevState => {
		if(prevState.expanded !== this.state.expanded) {
			this.cleanupHTML()
		}
	}
	
	getImageAttachments = () => {
		const { enqueueSnackbar, data } = this.props
		Api.inbox.getImageAttachments(data.item).then(res => {
			this.setState({ images: res })
		}).catch(err => {
			enqueueSnackbar(err, { variant: 'error' })
		})
	}

	formatHTML = html => {
		html = html.replace('<br><div class="gmail_quote">', '<div class="gmail_quote">')
		this.state.images.forEach(img => html = html.replace(`cid:${img.cid}`, img.data))
		return html
	}

	cleanupHTML = () => {
		const gmail_quotes = document.querySelectorAll('.gmail_quote')
		if(this.props.data.isResponse) gmail_quotes.forEach(quote => quote.remove())
	}

	formatText = text => {
		if(!text) return
		text = text.replace(/\n/g, ' ')
		if(text.includes('[image:')) text = text.split('[image:')[1].split(']')[1]
		if(text.length > 128) text = `${text.slice(0, 128)}...`
		return text
	}
	
	onStarClick = e => this.props.data.setFavorite(!this.props.data.item.favorite)
}

const styles = theme => ({
	card: {
		width: '100%'
	},
	subjectRoot: {
		display: 'flex',
		alignItems: 'center',
		padding: 8
	},
	subject: {
		flex: '1 1 auto',
		marginLeft: theme.spacing(1),
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	action: {
		flex: '0 0 auto',
		alignSelf: 'flex-start',
		marginBottom: -4
	},
	header: {
		paddingTop: props => props.data.isResponse ? 16 : 0
	},
	content: {
		paddingBottom: '16px !important'
	},
	attachmentContainer: {
		display: 'flex',
		flexDirection: 'column',
		margin: theme.spacing(2),
		marginTop: 0
	},
	attachments: {
		marginLeft: theme.spacing(1)
	},
	iconButton: {
		padding: 8
	},
	typography: {
		textAlign: 'center',
		width: '50%'
	},
	icon: {
		pointerEvents: 'none'
	},
})

export default withStyles(styles, { withTheme: true })(withSnackbar(withWidth()(InboxItemFull)))